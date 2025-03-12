import React, { useEffect, useRef, useCallback } from 'react';
import { Cartesian2, Color, Ellipsoid, GeoJsonDataSource, ScreenSpaceEventHandler, ScreenSpaceEventType } from 'cesium';
import { get } from 'lodash';
import { Feature } from 'geojson';
import { useCesiumMap } from '../map';

const toDegrees = (coord: number) => (coord * 180) / Math.PI;

const innerHTML = `<iframe class="cesium-infoBox-iframe" sandbox="allow-same-origin allow-popups allow-forms allow-scripts" data-bind="style : { maxHeight : maxHeightOffset(40) }" allowfullscreen="true" src="about:blank" style="max-height: 526px; height: 192px;">
  <html>
    <head><link href="http://localhost:9010/cesium/Widgets/InfoBox/InfoBoxDescription.css" rel="stylesheet" type="text/css"></head>
    <body>
      <div class="cesium-infoBox-description" dir="rtl">
        <table class="cesium-infoBox-defaultTable">
          <tbody>
            <tr><th>osm_id</th><td>959703929XXXXX</td></tr>
            <tr><th>id</th><td>3382</td></tr>
            <tr><th>building_type</th><td>yes</td></tr>
            <tr><th>sensitivity</th><td>רגיש</td></tr>
            <tr><th>entity_id</th><td>{66f12ef3-80c5-41c0-b539-1ac8afd83f87}</td></tr>
            <tr><th>is_sensitive</th><td>true</td></tr>
            <tr><th>date</th><td>2022-07-26T11:01:41Z</td></tr>
          </tbody>
        </table>
      </div>
    </body>
  </html>
</iframe>`;

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
  const wfsDataSourceRef = useRef<GeoJsonDataSource | null>(null);
  const wfsCache = useRef(new Set<string>());
  const page = useRef(0);

  const fetchAndUpdateWfs = useCallback(async (offset = 0) => {
    if (!mapViewer) { return; }

    const bbox = mapViewer.camera.computeViewRectangle(Ellipsoid.WGS84);
    if (!bbox) { return; }

    if (mapViewer.currentZoomLevel as number <= zoomLevel) {
      if (wfsDataSourceRef.current) {
        wfsDataSourceRef.current.entities.removeAll();
      }
      wfsCache.current.clear();
      page.current = 0;
      return;
    }

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

    if (wfsDataSourceRef.current) {
      await wfsDataSourceRef.current.process(newGeoJson, style);
      mapViewer.scene.requestRender();
      if (layer.numberReturned !== 0) {
        fetchAndUpdateWfs(page.current++ * pageSize);
      } else {
        page.current = 0;
      }
    }
  }, []);

  const onLoad = useCallback(() => {
    const infoBoxFrame = mapViewer.infoBox.frame;
    const span = document.createElement('span');
    span.innerHTML = 'kuku';
    if (infoBoxFrame?.contentDocument) {
      infoBoxFrame.contentDocument.body.innerHTML = innerHTML;
    }
    infoBoxFrame?.contentWindow?.document.body.appendChild(span);
  }, []);

  useEffect(() => {
    const wfsDataSource = new GeoJsonDataSource('wfs');
    wfsDataSourceRef.current = wfsDataSource;
    mapViewer.dataSources.add(wfsDataSource);

    const fetchHandler = () => {
      fetchAndUpdateWfs();
    };
    mapViewer.scene.camera.moveEnd.addEventListener(fetchHandler);

    const loadHandler = () => {
      onLoad();
    };
    mapViewer.infoBox.frame.addEventListener('load', loadHandler);

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
        mapViewer.infoBox.frame.removeEventListener('load', loadHandler);
        handler.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
      }
    };
  }, []);

  return null;
};