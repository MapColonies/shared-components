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
// import { WfsClient, Filter, Geom } from '@map-colonies/wfs-client';
// import bboxPolygon from '@turf/bbox-polygon';
import { pMap } from '../helpers/pMap';
import { distance, center, rectangle2bbox, computeLimitedViewRectangle } from '../helpers/utils';
import { CesiumViewer, useCesiumMap } from '../map';

export interface ICesiumWFSLayerOptions {
  url: string;
  featureType: string;
  style: Record<string, unknown>;
  pageSize: number;
  zoomLevel: number;
  maxCacheSize: number;
  sortBy?: string;
}

export interface ICesiumWFSLayer extends React.Attributes {
  options: ICesiumWFSLayerOptions;
  meta: Record<string, unknown>;
  visualizationHandler: (mapViewer: CesiumViewer, wfsDataSource: GeoJsonDataSource, processedEntityIds: Set<string>) => void;
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
  const { url, featureType, style, pageSize, zoomLevel, maxCacheSize, sortBy = 'id' } = options;
  const { color, hover } = style;
  const mapViewer = useCesiumMap();
  const fetchMetadata = useRef<Map<string, IFetchMetadata>>(new Map());
  const wfsCache = useRef(new Set<string>());
  const page = useRef(0);
  const [metadata, setMetadata] = useState(meta);
  const geojsonColor = useMemo(() => CesiumColor.fromCssColorString((color as string) ?? '#01FF1F').withAlpha(0.5), [color]);
  const geojsonColor2D = useMemo(() => CesiumColor.fromCssColorString((color as string) ?? '#01FF1F').withAlpha(0.2), [color]);
  const geojsonHoveredColor = useMemo(() => CesiumColor.fromCssColorString((hover as string) ?? '#24AEE9').withAlpha(0.5), [hover]);
  const dataSourceName = useMemo(() => `wfs_${featureType}`, [featureType]);

  const wfsDataSource = new GeoJsonDataSource(dataSourceName);

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
    const candidates = drill.map((p) => p.id).filter((id) => id && id.polygon);

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
      const is3D = mapViewer.scene.mode === SceneMode.SCENE3D;
      if (!is3D) {
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
        // 3D
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
          const osmId = f.properties?.osm_id;
          if (!wfsCache.current.has(osmId)) {
            wfsCache.current.add(osmId);
            (f.properties as any).fetch_id = fetchId;
            newFeatures.push(f);
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
          const osmId = entity.properties.osm_id.getValue();
          wfsCache.current.delete(osmId);
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

    await wfsDataSource.process(newGeoJson);
    mapViewer.scene.requestRender();

    const dataSource = mapViewer.dataSources.getByName(dataSourceName)[0] as GeoJsonDataSource;
    if (dataSource) {
      visualizationHandler(mapViewer, dataSource, new Set(newFeatures.map((feature) => feature.id as string)));
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
    if (!bbox) return;

    if (!mapViewer.currentZoomLevel || mapViewer.currentZoomLevel < zoomLevel) {
      hideEntities();
      return;
    }

    wfsDataSource.show = true;
    const extent: BBox = rectangle2bbox(bbox);
    const position: Feature<Point> = center(bbox);

    try {
      // #region WfsClient
      /*const wfsClient = new WfsClient('2.0.0', url);
      const requestBody = wfsClient.GetFeatureRequest({
        featureNS: 'core',
        featurePrefix: 'core',
        featureTypes: [featureType],
        startIndex: offset,
        count: pageSize,
        filter: Filter.intersects('geom', new Geom.Polygon(bboxPolygon(extent).geometry.coordinates), 'CRS:84'),
      });
      const sortByBlock = `<SortBy><SortProperty><ValueReference>${sortBy}</ValueReference><SortOrder>ASC</SortOrder></SortProperty></SortBy>`;
      if (requestBody.body.includes('<\/Query>')) {
        requestBody.body = requestBody.body.replace('<\/Query>', `${sortByBlock}<\/Query>`);
      } else if (requestBody.body.includes('<Query')) {
        requestBody.body = requestBody.body.replace('\/>', `>${sortByBlock}<\/Query>`);
      }
      const requestBodyXml = requestBody.body;
      // console.log('requestBodyXml', requestBodyXml);
      const wfsResponse = await fetchWfsData(url, 'POST', requestBodyXml);*/
      // #endregion

      const wfsDataUrl = `${url}?service=WFS&version=2.0.0&request=GetFeature&typeNames=${featureType}&outputFormat=application/json&bbox=${extent.join(',')},EPSG:4326&startIndex=${offset}&count=${pageSize}&sortBy=${sortBy}%20ASC`;
      const wfsResponse = await fetchWfsData(wfsDataUrl);
      if (wfsResponse?.features[0]?.geometry) {
        wfsResponse.features[0].geometry = {
          coordinates: [35.47117272860845, 33.09099957271394],
          type: 'Point',
        };
      }
      if (wfsResponse?.features[1]?.geometry) {
        wfsResponse.features[1].geometry = {
          coordinates: [
            [35.4690255709979, 33.09229606234996],
            [35.471490042224076, 33.09184494707435],
            [35.47664679294357, 33.08964138919352],
            [35.478593518115474, 33.08866972407918],
            [35.47902842480198, 33.08790626538486],
            [35.47890416574867, 33.087264260898436],
            [35.47888345590599, 33.08707339379575],
            [35.48507569873726, 33.084973828323044],
            [35.48760229949167, 33.08521675581805],
          ],
          type: 'LineString',
        };
      }
      if (wfsResponse?.features[2]?.geometry) {
        wfsResponse.features[2].geometry = {
          "coordinates": [
            [
              [
                [35.476344634437226,33.09081127029634],
                [35.47590759909494,33.09040204180434],
                [35.476781669779456,33.090423580193274],
                [35.47773286434801,33.09044511857691],
                [35.47775857230897,33.09109126764133],
                [35.476344634437226,33.09081127029634]
              ]
            ],
            [
              [
                [35.47755290861892,33.09007896533265],
                [35.47786140415516,33.08958357910531],
                [35.47870976687756,33.08979896476484],
                [35.4790182624138,33.090423580193274],
                [35.47755290861892,33.09007896533265]
              ]
            ]
          ],
          "type": "MultiPolygon"
        };
      }
      await handleWfsResponse(wfsResponse, extent, offset, position);
    } catch (error) {
      console.error('Error fetching WFS data:', error);
      updateMetadata(-1, -1);
    }
  }, []);

  useEffect((): void => {
    const dataSource = mapViewer.dataSources.getByName(dataSourceName)[0] as GeoJsonDataSource;
    if (dataSource) {
      visualizationHandler(mapViewer, dataSource, new Set());
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
