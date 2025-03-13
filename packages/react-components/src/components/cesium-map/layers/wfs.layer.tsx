import React, { useEffect, useRef, useCallback } from 'react';
import { Cartesian2, Color, Ellipsoid, GeoJsonDataSource, ScreenSpaceEventHandler, ScreenSpaceEventType } from 'cesium';
import { get } from 'lodash';
import { Feature } from 'geojson';
import { useCesiumMap } from '../map';

const CACHE_MAX_SIZE = 50000; // Size in heap: 500 MB
const CACHE_MAX_TIME = 5; // (minutes)
const CACHE_MAX_DISTANCE = 2500; // (meters) Zoom level 15 = 2.5 meters per pixel
// Calculation was based on: in this area 50K features with area of approximately 200 m each can feet inside

const toDegrees = (coord: number) => (coord * 180) / Math.PI;

export interface CesiumWFSLayerOptions {
  url: string;
  featureType: string;
  style: Record<string, unknown>;
  pageSize: number;
  zoomLevel: number;
  meta?: Record<string, unknown>;
  sortBy?: string;
  shouldFilter?: boolean;
}

export interface CesiumWFSLayerProps {
  options: CesiumWFSLayerOptions;
}

export const CesiumWFSLayer: React.FC<CesiumWFSLayerProps> = ({ options }) => {
  const { url, featureType, style, pageSize, zoomLevel, meta, sortBy, shouldFilter } = options;
  const mapViewer = useCesiumMap();
  const wfsCache = useRef(new Set<string>());
  const page = useRef(0);
  const wfsDataSource = new GeoJsonDataSource('wfs');

  const fetchAndUpdateWfs = useCallback(async (offset = 0) => {
    if (!mapViewer) { return; }

    const bbox = mapViewer.camera.computeViewRectangle(Ellipsoid.WGS84);
    if (!bbox) { return; }

    if (!mapViewer.currentZoomLevel || mapViewer.currentZoomLevel as number <= zoomLevel) {
      if (wfsDataSource.entities && wfsDataSource.entities.values.length > 0) {
        wfsDataSource.show = false;
        page.current = 0;
      }
      return;
    }

    wfsDataSource.show = true;
    console.log('cache size: ', wfsCache.current.size);

    const filterSection = shouldFilter ? `
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
      </fes:Filter>` : '';

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
      <wfs:Query typeNames="${featureType}">
        ${filterSection}
        <wfs:SortBy>
          <wfs:SortProperty>
            <wfs:ValueReference>${sortBy}</wfs:ValueReference>
            <wfs:SortOrder>ASC</wfs:SortOrder>
          </wfs:SortProperty>
        </wfs:SortBy>
      </wfs:Query>
      <wfs:Count>${pageSize}</wfs:Count>
      <wfs:StartIndex>${offset}</wfs:StartIndex>
    </wfs:GetFeature>`;

    const response = await fetch(url, {
      method: 'POST',
      body: req_body_xml
    });
    const layer = await response.json();

    const newFeatures = layer.features.filter((f: Feature) => !wfsCache.current.has(f.properties?.osm_id));
    
    if (newFeatures.length === 0) {
      if (layer.numberReturned !== 0) {
        fetchAndUpdateWfs(page.current++ * pageSize);
      } else {
        page.current = 0;
      }
      return;
    }

    newFeatures.forEach((f: Feature) => {
      wfsCache.current.add(f.properties?.osm_id);
    });

    const newGeoJson = {
      type: "FeatureCollection",
      features: newFeatures
    };

    await wfsDataSource.process(newGeoJson, style);
    mapViewer.scene.requestRender();
    if (layer.numberReturned !== 0) {
      fetchAndUpdateWfs(page.current++ * pageSize);
    } else {
      page.current = 0;
    }
  }, [mapViewer.currentZoomLevel]);

  useEffect(() => {
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
            hoveredEntity.polygon.material = style.fill;
          }
          hoveredEntity = pickedObject.id;
          hoveredEntity.polygon.material = Color.BLUE.withAlpha(0.8);
        }
      } else {
        if (hoveredEntity) {
          hoveredEntity.polygon.material = style.fill;
          hoveredEntity = null;
        }
      }
    }, ScreenSpaceEventType.MOUSE_MOVE);

    return () => {
      if (get(mapViewer, '_cesiumWidget') != undefined) {
        mapViewer.scene.camera.moveEnd.removeEventListener(fetchHandler);
        handler.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
      }
    };
  }, []);

  return null;
};
