import React, { useEffect, useMemo, useRef, useCallback, useState } from 'react';
import {
  Cartesian2,
  Color as CesiumColor,
  Ellipsoid,
  Entity,
  GeoJsonDataSource,
  Math as CesiumMath,
  Rectangle,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
} from 'cesium';
import { BBox, Feature, Point } from 'geojson';
import { get } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { pMap } from '../helpers/pMap';
import { distance, center, rectangle2bbox } from '../helpers/utils';
import { useCesiumMap } from '../map';

export interface ICesiumWFSLayerOptions {
  url: string;
  featureType: string;
  style: Record<string, unknown>;
  pageSize: number;
  zoomLevel: number;
  maxCacheSize: number;
  sortBy?: string;
  shouldFilter?: boolean;
}

export interface ICesiumWFSLayer extends React.Attributes {
  options: ICesiumWFSLayerOptions;
  meta: Record<string, unknown>;
}

interface IFetchMetadata {
  id: string;
  parentBBox: BBox;
  bbox: BBox;
  timestamp: Date;
  items?: number;
}

export const CesiumWFSLayer: React.FC<ICesiumWFSLayer> = ({ options, meta, ...restProps }) => {
  const { url, featureType, style, pageSize, zoomLevel, maxCacheSize, sortBy = 'id', shouldFilter = true } = options;
  const mapViewer = useCesiumMap();
  const fetchMetadata = useRef<Map<string, IFetchMetadata>>(new Map());
  const wfsCache = useRef(new Set<string>());
  const page = useRef(0);
  const [metadata, setMetadata] = useState(meta);
  const wfsDataSource = new GeoJsonDataSource('wfs');
  const loadOptions = useMemo<GeoJsonDataSource.LoadOptions>(() => ({
    stroke: CesiumColor.fromCssColorString(style.color as string),
    fill: CesiumColor.fromCssColorString(style.fill as string).withAlpha(0.5),
    strokeWidth: 3,
    clampToGround: true,
  }), [style.color, style.fill]);

  const handleMouseHover = (handler: ScreenSpaceEventHandler): void => {
    let hoveredEntity: any = null;
    handler.setInputAction((movement: { endPosition: Cartesian2 }): void => {
      const pickedObject = mapViewer.scene.pick(movement.endPosition);
      if (pickedObject && pickedObject.id && pickedObject.id.polygon) {
        if (hoveredEntity !== pickedObject.id) {
          if (hoveredEntity) {
            hoveredEntity.polygon.material = loadOptions.fill;
          }
          hoveredEntity = pickedObject.id;
          hoveredEntity.polygon.material = CesiumColor.BLUE.withAlpha(0.8);
        }
      } else {
        if (hoveredEntity) {
          hoveredEntity.polygon.material = loadOptions.fill;
          hoveredEntity = null;
        }
      }
    }, ScreenSpaceEventType.MOUSE_MOVE);
  };

  const getOptimalConcurrency = (arraySize: number, taskType: 'io' | 'cpu' | undefined) => {
    const cpuCores = navigator.hardwareConcurrency || 4; // Fallback to 4 if unavailable
    let baseConcurrency = Math.ceil(cpuCores * 1.5); // Scale concurrency based on cores
    if (taskType === 'cpu') {
      baseConcurrency = Math.max(2, Math.ceil(cpuCores / 2)); // Lower for CPU-heavy tasks
    }
    // Scale concurrency based on array size
    return arraySize >= maxCacheSize
      ? Math.min(200, baseConcurrency * 4)
      : arraySize > 1000
        ? Math.min(100, baseConcurrency * 2)
        : arraySize > 300
          ? Math.min(50, baseConcurrency)
          : Math.min(10, baseConcurrency);
  };

  const updateMetadata = (items: number, total: number): void => {
    setMetadata((prev) => ({
      ...prev,
      ...meta,
      cache: wfsCache.current.size,
      items,
      total,
      currentZoomLevel: mapViewer.currentZoomLevel,
    }));
  };

  const hideEntities = (): void => {
    if (wfsDataSource.entities && wfsDataSource.entities.values.length > 0) {
      wfsDataSource.show = false;
      page.current = 0;
    }
    updateMetadata(0, 0);
  };

  const buildFilterSection = (bbox: Rectangle): string => {
    return `
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
      </fes:Filter>`;
  };

  const buildRequestBody = (filterSection: string, offset: number): string => {
    return `<wfs:GetFeature
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
  };

  const fetchWfsData = async (body: string): Promise<any> => {
    const response = await fetch(url, { method: 'POST', body });
    return await response.json();
  };

  const processFeatures = async (features: Feature[], fetchId: string): Promise<Feature[]> => {
    const newFeatures: Feature[] = [];
    if (features.length > 0) {
      await pMap(features, (f: Feature): void => {
        const osmId = f.properties?.osm_id;
        if (!wfsCache.current.has(osmId)) {
          wfsCache.current.add(osmId);
          (f.properties as any).fetch_id = fetchId;
          newFeatures.push(f);
        }
      }, { concurrency: getOptimalConcurrency(features.length, 'cpu') });
    }
    return newFeatures;
  };

  const findFarthestFetchMetadata = (extent: BBox, position: Feature<Point>): { id: string; key: string; distance: number } => {
    return Array.from(fetchMetadata.current.values())
      .filter((item: IFetchMetadata) => JSON.stringify(item.parentBBox) !== JSON.stringify(extent))
      .reduce((farthest: { id: string; key: string; distance: number }, fetched: IFetchMetadata) => {
        const dist = distance(position, fetched.bbox);
        return dist > farthest.distance ? { id: fetched.id, key: fetched.bbox.join(','), distance: dist } : farthest;
      }, { id: '', key: '', distance: -Infinity });
  };

  const removeEntitiesByFetchId = async (fetchIdToRemove: string): Promise<void> => {
    const entitiesToDelete: Entity[] = [];
    await pMap(wfsDataSource.entities.values, (entity: Entity): void => {
      if (entity.properties && entity.properties.fetch_id.getValue() === fetchIdToRemove) {
        const osmId = entity.properties.osm_id.getValue();
        wfsCache.current.delete(osmId);
        entitiesToDelete.push(entity);
      }
    }, { concurrency: getOptimalConcurrency(wfsDataSource.entities.values.length, 'cpu') });
    if (entitiesToDelete.length > 0) {
      await pMap(entitiesToDelete, (entity: Entity): void => {
        wfsDataSource.entities.remove(entity);
      }, { concurrency: getOptimalConcurrency(entitiesToDelete.length, 'cpu') });
    }
  };

  const manageCache = async (extent: BBox, position: Feature<Point>): Promise<void> => {
    while (wfsCache.current.size > maxCacheSize) {
      const farthest = findFarthestFetchMetadata(extent, position);
      if (farthest.id === '') { break; }
      await removeEntitiesByFetchId(farthest.id);
      if (farthest.key) {
        fetchMetadata.current.delete(farthest.key);
      }
    }
  };

  const handleWfsResponse = async (wfsResponse: any, extent: BBox, offset: number, position: Feature<Point>): Promise<void> => {
    let fetchId = '';
    let bboxKey = '';
    let newFeatures: Feature[] = [];

    if (wfsResponse.numberReturned !== 0) {
      if (wfsResponse.bbox) {
        bboxKey = wfsResponse.bbox.join(',');
        if (!fetchMetadata.current.has(bboxKey)) {
          fetchId = uuidv4();
        }
      }

      newFeatures = await processFeatures(wfsResponse.features, fetchId);

      if (wfsResponse.bbox && newFeatures.length > 0 && !fetchMetadata.current.has(bboxKey)) {
        fetchMetadata.current.set(bboxKey, {
          id: fetchId,
          parentBBox: extent,
          bbox: wfsResponse.bbox,
          timestamp: wfsResponse.timeStamp,
          items: newFeatures.length,
        });
      }
    }

    updateMetadata(wfsResponse.numberReturned !== 0 ? offset + wfsResponse.numberReturned : wfsResponse.numberMatched, wfsResponse.numberMatched);

    if (newFeatures.length === 0) {
      if (wfsResponse.numberReturned !== 0) {
        fetchAndUpdateWfs(page.current++ * pageSize);
      } else {
        page.current = 0;
      }
      return;
    }
    await manageCache(extent, position);

    const newGeoJson = {
      type: 'FeatureCollection',
      features: newFeatures,
    };

    await wfsDataSource.process(newGeoJson, loadOptions);
    mapViewer.scene.requestRender();

    if (wfsResponse.numberReturned !== 0) {
      fetchAndUpdateWfs(page.current++ * pageSize);
    } else {
      page.current = 0;
    }
  };

  const fetchAndUpdateWfs = useCallback(async (offset = 0) => {
    if (!mapViewer) return;

    const bbox = mapViewer.camera.computeViewRectangle(Ellipsoid.WGS84);
    if (!bbox) return;

    if (!mapViewer.currentZoomLevel || mapViewer.currentZoomLevel < zoomLevel) {
      hideEntities();
      return;
    }

    wfsDataSource.show = true;
    const extent: BBox = rectangle2bbox(bbox);
    const position: Feature<Point> = center(bbox);
    const filterSection = shouldFilter ? buildFilterSection(bbox) : '';
    const requestBodyXml = buildRequestBody(filterSection, offset);

    try {
      const wfsResponse = await fetchWfsData(requestBodyXml);
      await handleWfsResponse(wfsResponse, extent, offset, position);
    } catch (error) {
      console.error('Error fetching WFS data:', error);
      updateMetadata(-1, -1);
    }
  }, []);

  useEffect(() => { // Happens each time the metadata from STATE changes
    if (mapViewer.layersManager &&
      mapViewer.layersManager.dataLayerList.length > 0 &&
      mapViewer.layersManager.findDataLayerById(meta.id as string) !== undefined) {
      mapViewer.layersManager.addMetaToDataLayer(metadata);
    }
  }, [metadata]);

  useEffect(() => { // Happens when layersManager is initialized by parent map component
    mapViewer.layersManager?.addDataLayer({ options, meta: { ...metadata } });
  }, [mapViewer.layersManager]);

  useEffect(() => {
    // DataSource
    mapViewer.dataSources.add(wfsDataSource);

    // Move event
    const fetchHandler = () => {
      fetchAndUpdateWfs();
    };
    mapViewer.scene.camera.moveEnd.addEventListener(fetchHandler);

    // Hover event
    const handler = new ScreenSpaceEventHandler(mapViewer.scene.canvas);
    handleMouseHover(handler);
    
    // Cleanup
    return () => {
      if (get(mapViewer, '_cesiumWidget') !== undefined) {
        mapViewer.scene.camera.moveEnd.removeEventListener(fetchHandler);
        handler.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
      }
    };
  }, []);

  return null;
};
