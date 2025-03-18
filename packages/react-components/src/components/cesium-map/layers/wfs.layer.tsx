import React, { useEffect, useRef, useCallback } from 'react';
import {
  Cartesian2,
  Color,
  Ellipsoid,
  Entity,
  GeoJsonDataSource,
  Math as CesiumMath,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType
} from 'cesium';
import { BBox, Feature } from 'geojson';
import { get } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { processArrayWithConcurrency } from '../helpers/pMap';
import { distance, center } from '../helpers/utils';
import { useCesiumMap } from '../map';

const CACHE_MAX_SIZE = 6000; // 50000 geometries -> size in heap: 1GB (1000 -> 20MB)
const CACHE_MAX_TIME = 5; // (minutes)
const CACHE_MAX_DISTANCE = 2.5; // (kilometers) Zoom level 15 = 2.5 meters per pixel
// Calculation was based on: in this area 50K features with area of approximately 200 m each can feet inside

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

interface FetchMetadata {
  id: string;
  parentBBox: BBox;
  bbox: BBox;
  timestamp: Date;
  items?: number;
}

export const CesiumWFSLayer: React.FC<CesiumWFSLayerProps> = ({ options }) => {
  const { url, featureType, style, pageSize, zoomLevel, meta, sortBy, shouldFilter } = options;
  const mapViewer = useCesiumMap();
  const fetchMetadata = useRef<Map<string, FetchMetadata>>(new Map());
  const wfsCache = useRef(new Set<string>());
  const page = useRef(0);
  const wfsDataSource = new GeoJsonDataSource('wfs');

  const fetchAndUpdateWfs = useCallback(async (offset = 0) => {
    if (!mapViewer) { return; }

    const bbox = mapViewer.camera.computeViewRectangle(Ellipsoid.WGS84);
    if (!bbox) { return; }

    if (!mapViewer.currentZoomLevel || mapViewer.currentZoomLevel < zoomLevel) {
      if (wfsDataSource.entities && wfsDataSource.entities.values.length > 0) {
        wfsDataSource.show = false;
        page.current = 0;
      }
      return;
    }

    wfsDataSource.show = true;

    console.log('Cache size: ', wfsCache.current.size);

    const extent: BBox = [
      CesiumMath.toDegrees(bbox.west),
      CesiumMath.toDegrees(bbox.south),
      CesiumMath.toDegrees(bbox.east),
      CesiumMath.toDegrees(bbox.north)
    ];

    const filterSection = shouldFilter ? `
      <fes:Filter>
        <fes:And>
          <fes:Intersects>
            <fes:ValueReference>geom</fes:ValueReference>
            <gml:Polygon srsName="EPSG:4326">
              <gml:exterior>
                <gml:LinearRing>
                  <gml:posList>
                    ${CesiumMath.toDegrees(bbox.west)} ${CesiumMath.toDegrees(bbox.south)} ${CesiumMath.toDegrees(bbox.west)} ${CesiumMath.toDegrees(bbox.north)} ${CesiumMath.toDegrees(bbox.east)} ${CesiumMath.toDegrees(bbox.north)} ${CesiumMath.toDegrees(bbox.east)} ${CesiumMath.toDegrees(bbox.south)} ${CesiumMath.toDegrees(bbox.west)} ${CesiumMath.toDegrees(bbox.south)}
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

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: req_body_xml
      });
      const json = await response.json();

      let fetchId: string = '';
      let bboxKey: string = '';
      if (json.numberReturned !== 0 && json.bbox) {
        bboxKey = json.bbox.join(',');
        if (!fetchMetadata.current.has(bboxKey)) {
          fetchId = uuidv4();
        }
      }

      const newFeatures: Feature[] = [];
      json.features.forEach((f: Feature) => {
        const osmId = f.properties?.osm_id;
        if (!wfsCache.current.has(osmId)) {
          wfsCache.current.add(osmId);
          (f.properties as any).fetch_id = fetchId;
          newFeatures.push(f);
        }
      });

      if (json.numberReturned !== 0 &&
        json.bbox &&
        newFeatures.length > 0 &&
        !fetchMetadata.current.has(bboxKey)) {
        fetchMetadata.current.set(bboxKey, {
          id: fetchId,
          parentBBox: extent,
          bbox: json.bbox,
          timestamp: json.timeStamp,
          items: newFeatures.length
        });
      }

      if (newFeatures.length === 0) {
        if (json.numberReturned !== 0) {
          fetchAndUpdateWfs(page.current++ * pageSize);
        } else {
          page.current = 0;
        }
        return;
      }

      if (wfsCache.current.size > CACHE_MAX_SIZE) {
        do {
          const position = center(bbox);
          const farthest = Array.from(fetchMetadata.current.values())
            .filter((item) => JSON.stringify(item.parentBBox) !== JSON.stringify(extent))
            .reduce((farthest, fetched) => {
              const dist = distance(position, fetched.bbox);
              return dist > farthest.distance ? { id: fetched.id, key: fetched.bbox.join(','), distance: dist } : farthest;
            }, { id: '', key: '', distance: -Infinity });

          if (farthest.id === '') {
            break;
          }

          const fetchIdToRemove = farthest.id;

          const entitiesToDelete: Entity[] = [];

          await processArrayWithConcurrency(
            wfsDataSource.entities.values,
            10,
            (entity: Entity) => {
              if (entity.properties && entity.properties.fetch_id.getValue() === fetchIdToRemove) {
                const osmId = entity.properties.osm_id.getValue();
                wfsCache.current.delete(osmId);
                entitiesToDelete.push(entity);
              }
            }
          );

          entitiesToDelete.forEach((entity) => {
            wfsDataSource.entities.remove(entity);
          });

          if (farthest.key) {
            fetchMetadata.current.delete(farthest.key);
          }

        } while (wfsCache.current.size > CACHE_MAX_SIZE);
      }

      const newGeoJson = {
        type: "FeatureCollection",
        features: newFeatures
      };

      await wfsDataSource.process(newGeoJson, style);
      mapViewer.scene.requestRender();

      if (json.numberReturned !== 0) {
        fetchAndUpdateWfs(page.current++ * pageSize);
      } else {
        page.current = 0;
      }
    } catch (error) {
      console.error('Error fetching WFS data:', error);
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
      if (get(mapViewer, '_cesiumWidget') !== undefined) {
        mapViewer.scene.camera.moveEnd.removeEventListener(fetchHandler);
        handler.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
      }
    };
  }, []);

  return null;
};
