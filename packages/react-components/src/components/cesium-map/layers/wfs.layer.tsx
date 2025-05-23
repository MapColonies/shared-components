import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import {
  Cartesian2,
  Color as CesiumColor,
  Entity,
  GeoJsonDataSource,
  SceneMode,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  JulianDate,
  Cartesian3,
  BoundingSphere,
  SceneTransforms,
} from 'cesium';
import { BBox, Feature, Point } from 'geojson';
import { get } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import pMap from 'p-map';
import { distance, center, rectangle2bbox, computeLimitedViewRectangle } from '../helpers/utils';
import { CesiumViewer, useCesiumMap } from '../map';

export interface ICesiumWFSLayerOptions {
  url: string;
  featureType: string;
  style: Record<string, unknown>;
  pageSize: number;
  zoomLevel: number;
  maxCacheSize: number;
  keyField?: string; // if PK is not defined, or is different from 'id', or sortBy should be used
}

export interface ICesiumWFSLayer extends React.Attributes {
  options: ICesiumWFSLayerOptions;
  meta: Record<string, unknown>;
  visualizationHandler: (mapViewer: CesiumViewer, wfsDataSource: GeoJsonDataSource, processEntityIds: string[]) => void;
}

interface IFetchMetadata {
  id: string;
  parentBBox: BBox;
  bbox: BBox;
  timestamp: Date;
  items?: number;
}

export const CesiumWFSLayer: React.FC<ICesiumWFSLayer> = (props) => {
  const { options, meta, visualizationHandler } = props;
  const { url, featureType, style, pageSize, zoomLevel, maxCacheSize, keyField } = options;
  const { color, hover } = style;
  const mapViewer = useCesiumMap();
  const fetchMetadata = useRef<Map<string, IFetchMetadata>>(new Map());
  const wfsCache = useRef(new Set<string>());
  const page = useRef(0);
  const [metadata, setMetadata] = useState(meta);
  const geojsonColor = useMemo(() => CesiumColor.fromCssColorString((color as string) ?? '#01FF1F').withAlpha(0.5), [color]);
  const geojsonColor2D = useMemo(() => CesiumColor.fromCssColorString((color as string) ?? '#01FF1F').withAlpha(0.2), [color]);
  const geojsonHoveredColor = useMemo(() => CesiumColor.fromCssColorString((hover as string) ?? '#24AEE9').withAlpha(0.5), [hover]);
  const dataSourceName = useMemo(() => `wfs_${featureType}_${uuidv4()}`, [featureType]);

  const wfsDataSource = new GeoJsonDataSource(dataSourceName);

  const describe = (properties: Record<string, any>): string => {
    const rows: string[] = [];
    const featureStructure = meta.featureStructure as { fields: { fieldName: string; aliasFieldName: string; type: string }[] };
    if (featureStructure && featureStructure.fields) {
      for (const field of featureStructure.fields) {
        const { fieldName, aliasFieldName } = field;
        const key = aliasFieldName;
        const value = properties[fieldName.toLowerCase()] ?? 'N/A';
        rows.push(`
          <tr>
            <td><strong>${key}:</strong></td>
            <td>${value}</td>
          </tr>
        `);
      }
    }
    const isRightToLeft = featureStructure.fields.some(field => field.aliasFieldName !== field.fieldName);
    return `
      <table style="direction: ${isRightToLeft ? 'rtl' : 'ltr'};">
        <tbody>
          ${rows.join('')}
        </tbody>
      </table>
    `;
  };

  const getEntityEnteriorGeometry = (entity: Entity): string => {
    if (entity) {
      return entity.polyline ? 'polyline' : 'polygon';
    }
    return '';
  };

  const getEntityCenter = (entity: Entity): Cartesian3 | null => {
    const hierarchy = entity?.polygon?.hierarchy?.getValue(JulianDate.now());
    if (!hierarchy) return null;
    const positions = hierarchy.positions;
    return BoundingSphere.fromPoints(positions).center;
  };

  const getClosestPolygonEntityUnderMouse = (screenPosition: Cartesian2) => {
    const drill = mapViewer.scene.drillPick(screenPosition);
    const candidates = drill.map((p) => p.id).filter((id) => id && id.polygon && id.entityCollection.owner.name === dataSourceName);

    if (candidates.length === 0) return null;

    const scored = candidates.map((entity) => {
      const worldPos = getEntityCenter(entity);
      if (!worldPos) return { entity, distance: Number.MAX_VALUE };

      const screenPos = SceneTransforms.wgs84ToWindowCoordinates(mapViewer.scene, worldPos);
      if (!screenPos) return { entity, distance: Number.MAX_VALUE };

      const dx = screenPosition.x - screenPos.x;
      const dy = screenPosition.y - screenPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      return { entity, distance };
    });

    scored.sort((a, b) => b.distance - a.distance);

    return scored[0].entity;
  };

  const handleMouseHover = (handler: ScreenSpaceEventHandler): void => {
    let hoveredEntity: any = null;
    handler.setInputAction((movement: { endPosition: Cartesian2 }): void => {
      const is2D = mapViewer.scene.mode === SceneMode.SCENE2D;
      if (is2D) {
        const pickedObject = mapViewer.scene.pick(movement.endPosition);
        if (pickedObject && pickedObject.id && (pickedObject.id.polygon || pickedObject.id.polyline)) {
          if (get(hoveredEntity, 'id') !== get(pickedObject.id, 'id')) {
            if (hoveredEntity) {
              // Resetting previous entity
              hoveredEntity[getEntityEnteriorGeometry(hoveredEntity)].material = geojsonColor2D;
              (mapViewer.container as HTMLElement).style.cursor = 'default';
            }
            hoveredEntity = pickedObject.id;
            hoveredEntity[getEntityEnteriorGeometry(hoveredEntity)].material = geojsonHoveredColor;
            (mapViewer.container as HTMLElement).style.cursor = 'pointer';
          }
        } else {
          // No entity was picked thus the mouse is outside of any entity
          if (hoveredEntity) {
            // Resetting previous entity
            hoveredEntity[getEntityEnteriorGeometry(hoveredEntity)].material = geojsonColor2D;
            hoveredEntity = null;
            (mapViewer.container as HTMLElement).style.cursor = 'default';
          }
        }
      } else {
        // 3D or Columbus mode
        const closestPolygon = getClosestPolygonEntityUnderMouse(movement.endPosition);

        if (closestPolygon) {
          // If new polygon is different from current hovered
          if (get(hoveredEntity, 'id') !== get(closestPolygon, 'id')) {
            // Resetting previous hovered polygon
            if (hoveredEntity) {
              hoveredEntity[getEntityEnteriorGeometry(hoveredEntity)].material = geojsonColor;
              (mapViewer.container as HTMLElement).style.cursor = 'default';
            }
            // Highlight new hovered polygon
            hoveredEntity = closestPolygon;
            hoveredEntity[getEntityEnteriorGeometry(hoveredEntity)].material = geojsonHoveredColor;
            (mapViewer.container as HTMLElement).style.cursor = 'pointer';
          }
        } else {
          // No polygon hovered anymore
          if (hoveredEntity) {
            // Resetting previous hovered polygon
            hoveredEntity[getEntityEnteriorGeometry(hoveredEntity)].material = geojsonColor;
            hoveredEntity = null;
            (mapViewer.container as HTMLElement).style.cursor = 'default';
          }
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

  const updateMetadata = (items: number = -1, total: number = -1): void => {
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

  const fetchWfsData = async (wfsDataUrl: string, method: string = 'GET', body?: string): Promise<any> => {
    const options: RequestInit = { method };
    if (body !== undefined) {
      options.body = body;
    }
    const response = await fetch(wfsDataUrl, options);
    if (response.status === 200) {
      return await response.json();
    }
    return undefined;
  };

  const processFeatures = async (features: Feature[], fetchId: string): Promise<Feature[]> => {
    const newFeatures: Feature[] = [];
    if (features.length > 0) {
      await pMap(
        features,
        (f: Feature): void => {
          if (f.properties) {
            const keyFieldValue = f.properties[keyField ?? 'id'];
            if (!wfsCache.current.has(keyFieldValue)) {
              wfsCache.current.add(keyFieldValue);
              (f.properties as any).fetch_id = fetchId;
              newFeatures.push(f);
            }
          }
        },
        { concurrency: getOptimalConcurrency(features.length, 'cpu') }
      );
    }
    return newFeatures;
  };

  const findFarthestFetchMetadata = (extent: BBox, position: Feature<Point>): { id: string; key: string; distance: number } => {
    return Array.from(fetchMetadata.current.values())
      .filter((item: IFetchMetadata) => JSON.stringify(item.parentBBox) !== JSON.stringify(extent))
      .reduce(
        (farthest: { id: string; key: string; distance: number }, fetched: IFetchMetadata) => {
          const dist = distance(position, fetched.bbox);
          return dist > farthest.distance ? { id: fetched.id, key: fetched.bbox.join(','), distance: dist } : farthest;
        },
        { id: '', key: '', distance: -Infinity }
      );
  };

  const removeEntitiesByFetchId = async (fetchIdToRemove: string): Promise<void> => {
    const entitiesToDelete: Entity[] = [];
    await pMap(
      wfsDataSource.entities.values,
      (entity: Entity): void => {
        if (entity.properties && entity.properties.fetch_id.getValue() === fetchIdToRemove) {
          const keyFieldValue = entity.properties[keyField ?? 'id'].getValue();
          wfsCache.current.delete(keyFieldValue);
          entitiesToDelete.push(entity);
        }
      },
      { concurrency: getOptimalConcurrency(wfsDataSource.entities.values.length, 'cpu') }
    );
    if (entitiesToDelete.length > 0) {
      await pMap(
        entitiesToDelete,
        (entity: Entity): void => {
          wfsDataSource.entities.remove(entity);
        },
        { concurrency: getOptimalConcurrency(entitiesToDelete.length, 'cpu') }
      );
    }
  };

  const manageCache = async (extent: BBox, position: Feature<Point>): Promise<void> => {
    while (wfsCache.current.size > maxCacheSize) {
      const farthest = findFarthestFetchMetadata(extent, position);
      if (farthest.id === '') {
        break;
      }
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

    if (wfsResponse.numberReturned && wfsResponse.numberReturned !== 0) {
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
      if (wfsResponse.numberReturned && wfsResponse.numberReturned !== 0) {
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

    await wfsDataSource.process(newGeoJson, { describe });
    mapViewer.scene.requestRender();

    const dataSource = mapViewer.dataSources.getByName(dataSourceName)[0] as GeoJsonDataSource;
    if (dataSource) {
      visualizationHandler(
        mapViewer,
        dataSource,
        newFeatures.map((feature) => feature.id as string)
      );
    }

    if (wfsResponse.numberReturned && wfsResponse.numberReturned !== 0) {
      fetchAndUpdateWfs(page.current++ * pageSize);
    } else {
      page.current = 0;
    }
  };

  const fetchAndUpdateWfs = useCallback(async (offset = 0) => {
    if (!mapViewer || mapViewer.scene.mode === SceneMode.MORPHING) return;

    // const bbox = mapViewer.camera.computeViewRectangle(Ellipsoid.WGS84);
    const bbox = computeLimitedViewRectangle(mapViewer);
    if (!bbox) {
      return;
    }

    if (!mapViewer.currentZoomLevel || mapViewer.currentZoomLevel < zoomLevel) {
      hideEntities();
      return;
    }

    wfsDataSource.show = true;
    const extent: BBox = rectangle2bbox(bbox);
    const position: Feature<Point> = center(bbox);

    try {
      let wfsDataUrl = `${url}?service=WFS&version=2.0.0&request=GetFeature&typeNames=${featureType}&outputFormat=application/json&bbox=${extent.join(',')},EPSG:4326&startIndex=${offset}&count=${pageSize}`;
      if (keyField) {
        wfsDataUrl += `&sortBy=${keyField}%20ASC`;
      }
      const wfsResponse = await fetchWfsData(wfsDataUrl);
      await handleWfsResponse(wfsResponse, extent, offset, position);
    } catch (error) {
      console.error('Error fetching WFS data:', error);
      updateMetadata(-1, -1);
    }
  }, []);

  useEffect((): void => {
    const dataSource = mapViewer.dataSources.getByName(dataSourceName)[0] as GeoJsonDataSource;
    if (dataSource) {
      visualizationHandler(mapViewer, dataSource, []);
    }
  }, [mapViewer.scene.mode]);

  useEffect(() => {
    // Happens each time the metadata from STATE changes
    if (
      mapViewer.layersManager &&
      mapViewer.layersManager.dataLayerList.length > 0 &&
      mapViewer.layersManager.findDataLayerById(meta.id as string) !== undefined
    ) {
      mapViewer.layersManager.addMetaToDataLayer(metadata);
    }
  }, [metadata]);

  useEffect(() => {
    // Happens when layersManager is initialized by parent map component
    mapViewer.layersManager?.addDataLayer({ options, meta: { ...metadata }, visualizationHandler });
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
        wfsCache.current.clear();
        fetchMetadata.current.clear();
        mapViewer.dataSources.remove(wfsDataSource, true);
        mapViewer.layersManager?.removeDataLayer(meta.id as string);
        mapViewer.scene.camera.moveEnd.removeEventListener(fetchHandler);
        handler.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
      }
    };
  }, []);

  return null;
};
