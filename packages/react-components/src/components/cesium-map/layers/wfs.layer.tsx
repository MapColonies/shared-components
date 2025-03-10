import React, { useEffect, useRef, useCallback } from 'react';
import { Cartesian2, Color, Ellipsoid, GeoJsonDataSource, ScreenSpaceEventHandler, ScreenSpaceEventType } from 'cesium';
import { get } from 'lodash';
import { Feature } from 'geojson';
import { useCesiumMap } from '../map';

const featureName = 'core:buildings';
const wfsUrl = 'http://geoserver-vector-dev.apps.j1lk3njp.eastus.aroapp.io/geoserver/core/ows';
const pageSize = 300;
const defaultFillMaterial = Color.RED.withAlpha(0.5);

const layerStyle = {
  stroke: Color.RED,
  fill: defaultFillMaterial,
  strokeWidth: 3,
  markerSymbol: '?'
};

const toDegrees = (coord: number) => (coord * 180) / Math.PI;

export const CesiumWFSLayer: React.FC = () => {
  const mapViewer = useCesiumMap();
  const wfsDataSourceRef = useRef<GeoJsonDataSource | null>(null);
  const wfsCache = useRef(new Set<string>());
  const page = useRef(0);

  const fetchAndUpdateWfs = useCallback(async (offset = 0) => {
    if (!mapViewer) { return; }

    const bbox = mapViewer.camera.computeViewRectangle(Ellipsoid.WGS84);
    if (!bbox) { return; }
    
    if (mapViewer.currentZoomLevel as number <= 14) { return; }

    const req_body_xml = `<wfs:GetFeature
      xmlns:wfs="http://www.opengis.net/wfs/2.0"
      xmlns:fes="http://www.opengis.net/fes/2.0"
      xmlns:gml="http://www.opengis.net/gml/3.2"
      xmlns:sf="http://www.openplans.org/spearfish"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      service="WFS" 
      version="2.0.0"
      xsi:schemaLocation="http://www.opengis.net/wfs/2.0
      http://schemas.opengis.net/wfs/2.0/wfs.xsd 
      http://www.opengis.net/gml/3.2 
      http://schemas.opengis.net/gml/3.2.1/gml.xsd" 
      outputFormat="application/json">
      <wfs:Query typeNames="${featureName}">
        <fes:Filter>
          <fes:And>
            <fes:Intersects>
              <fes:ValueReference>geom</fes:ValueReference>
              <gml:Polygon srsName="EPSG:4326">
                <gml:exterior>
                  <gml:LinearRing>
                    <gml:posList>
                      ${toDegrees(bbox.west)} ${toDegrees(bbox.south)} ${toDegrees(bbox.west)} ${toDegrees(bbox.north)} ${toDegrees(bbox.east)} ${toDegrees(bbox.north)} ${toDegrees(bbox.east)} ${toDegrees(bbox.south)} ${toDegrees(bbox.west)} ${toDegrees(bbox.south)}
                    </gml:posList>
                  </gml:LinearRing>
                </gml:exterior>
              </gml:Polygon>
            </fes:Intersects>
          </fes:And>
        </fes:Filter>
        <wfs:SortBy>
          <wfs:SortProperty>
            <wfs:ValueReference>id</wfs:ValueReference>
            <wfs:SortOrder>ASC</wfs:SortOrder>
          </wfs:SortProperty>
        </wfs:SortBy>
      </wfs:Query>
      <wfs:Count>${pageSize}</wfs:Count>
      <wfs:StartIndex>${offset}</wfs:StartIndex>
    </wfs:GetFeature>`;

    const response = await fetch(wfsUrl, {
      method: 'POST',
      body: req_body_xml
    });
    const geoJson = await response.json();

    const newFeatures = geoJson.features.filter((f: Feature) => !wfsCache.current.has(f.properties?.osm_id));
    
    if (newFeatures.length === 0) {
      if (geoJson.numberReturned !== 0) {
        fetchAndUpdateWfs(page.current++ * pageSize);
      } else {
        page.current = 0;
      }
      return;
    }

    newFeatures.forEach((f: Feature) => {
      wfsCache.current.add(f.properties?.osm_id);
    });

    const updatedGeoJson = {
      type: "FeatureCollection",
      features: newFeatures
    };

    if (wfsDataSourceRef.current) {
      await wfsDataSourceRef.current.process(updatedGeoJson, layerStyle);
      if (geoJson.numberReturned !== 0) {
        fetchAndUpdateWfs(page.current++ * pageSize);
      } else {
        page.current = 0;
      }
    }
  }, []);

  useEffect(() => {
    const wfsDataSource = new GeoJsonDataSource('wfs');
    wfsDataSourceRef.current = wfsDataSource;
    mapViewer.dataSources.add(wfsDataSource);

    const fetchHandler = () => {
      fetchAndUpdateWfs();
    };

    mapViewer.scene.camera.moveEnd.addEventListener(fetchHandler);

    let hoveredEntity: any = null;
    const handler = new ScreenSpaceEventHandler(mapViewer.scene.canvas);
    handler.setInputAction((movement: { endPosition: Cartesian2; }) => {
      const pickedObject = mapViewer.scene.pick(movement.endPosition);
      if (pickedObject && pickedObject.id && pickedObject.id.polygon) {
        if (hoveredEntity !== pickedObject.id) {
          if (hoveredEntity) {
            hoveredEntity.polygon.material = defaultFillMaterial;
          }
          hoveredEntity = pickedObject.id;
          hoveredEntity.polygon.material = Color.BLUE.withAlpha(0.8);
        }
      } else {
        if (hoveredEntity) {
          hoveredEntity.polygon.material = defaultFillMaterial;
          hoveredEntity = null;
        }
      }
    }, ScreenSpaceEventType.MOUSE_MOVE);

    return () => {
      if (get(mapViewer, '_cesiumWidget') != undefined) {
        mapViewer.camera.moveEnd.removeEventListener(fetchHandler);
        handler.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
      }
    };
  }, []);

  return null;
};