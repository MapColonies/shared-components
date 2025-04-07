import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react';
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
  SceneMode,
  defined,
  Cartesian3,
  PerspectiveFrustum,
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

export const CesiumWFSLayer: React.FC<ICesiumWFSLayer> = (props) => {
  const { options, meta } = props;
  const { url, featureType, style, pageSize, zoomLevel, maxCacheSize, sortBy = 'id', shouldFilter = true } = options;
  const { color, hover } = style;
  const mapViewer = useCesiumMap();
  const fetchMetadata = useRef<Map<string, IFetchMetadata>>(new Map());
  const wfsCache = useRef(new Set<string>());
  const page = useRef(0);
  const [metadata, setMetadata] = useState(meta);
  const geojsonColor = useMemo(() => CesiumColor.fromCssColorString(color as string ?? '#01FF1F'), [color]);
  const geojsonHoveredColor = useMemo(() => CesiumColor.fromCssColorString(hover as string ?? '#24AEE9').withAlpha(0.5), [hover]);
  // const describeFeature = useMemo(() => {
  //   return (properties: any, nameProperty: string): string => {
  //     const name = properties[nameProperty] || 'Unnamed Feature';
  //     const description = `
  //       <strong>Name:</strong> ${name}<br>
  //       <strong>Type:</strong> ${properties.type || 'N/A'}<br>
  //       <strong>Population:</strong> ${properties.population || 'N/A'}
  //     `;
  //     return description;
  //   };
  // }, []);
  const loadOptions = useMemo((): GeoJsonDataSource.LoadOptions => ({
    stroke: mapViewer.scene.mode !== SceneMode.SCENE3D ? geojsonColor : undefined,
    strokeWidth: mapViewer.scene.mode !== SceneMode.SCENE3D ? 3 : undefined,
    fill: mapViewer.scene.mode === SceneMode.SCENE3D ? geojsonColor : undefined,
    clampToGround: mapViewer.scene.mode === SceneMode.SCENE3D,
    markerColor: geojsonColor,
    markerSymbol: undefined,
    // describe: describeFeature,
  }), [mapViewer.scene.mode]);


  const wfsDataSource = new GeoJsonDataSource('wfs');

  const handleMouseHover = (handler: ScreenSpaceEventHandler): void => {
    let hoveredEntity: any = null;
    handler.setInputAction((movement: { endPosition: Cartesian2 }): void => {
      const pickedObject = mapViewer.scene.pick(movement.endPosition);
      if (pickedObject && pickedObject.id && pickedObject.id.polygon) {
        if (hoveredEntity !== pickedObject.id) {
          if (hoveredEntity) { // Resetting previous entity
            hoveredEntity.polygon.material = geojsonColor;
          }
          hoveredEntity = pickedObject.id;
          hoveredEntity.polygon.material = geojsonHoveredColor;
        }
      } else { // No entity was picked thus the mouse is outside of any entity
        if (hoveredEntity) { // Resetting previous entity
          hoveredEntity.polygon.material = geojsonColor;
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

  const computeLimitedViewRectangle = (maxDistanceMeters = 100) => {
    const scene = mapViewer.scene;
    const camera = mapViewer.camera;
    const mode = scene.mode;

    // Get the full rectangle in 2D or 3D mode
    const fullRect = camera.computeViewRectangle(scene.globe.ellipsoid);

    // Check if fullRect is valid before proceeding
    if (!defined(fullRect)) {
      console.error("computeViewRectangle returned invalid rectangle.");
      return undefined;
    }

    // In 2D mode, just return the computed view rectangle directly
    if (mode === SceneMode.SCENE2D) {
      return fullRect;
    }

    // In 3D mode, proceed with the scaling logic
    const centerCartographic = camera.positionCartographic;

    if (!defined(centerCartographic)) {
      console.error("Camera position is undefined in 3D mode.");
      return undefined;
    }

    const lat = centerCartographic.latitude;
    const lon = centerCartographic.longitude;

    // Validate latitude and longitude to ensure they are within expected ranges
    if (lat < -CesiumMath.PI_OVER_TWO || lat > CesiumMath.PI_OVER_TWO ||
      lon < -CesiumMath.PI || lon > CesiumMath.PI) {
      console.error("Invalid latitude or longitude values.");
      return undefined;
    }

    // Calculate the meters per degree for latitude and longitude
    const metersPerDegreeLat = 111320;
    const metersPerDegreeLon = 111320 * Math.cos(lat);

    // Calculate the max deltas based on max distance (100 meters by default)
    let deltaLat = maxDistanceMeters / metersPerDegreeLat;
    let deltaLon = maxDistanceMeters / metersPerDegreeLon;

    // Get camera height above the ellipsoid (the altitude from the ground)
    const cameraHeight = Cartesian3.magnitude(camera.positionWC);

    // If the camera is at a very high altitude (showing the whole world), cap the green rectangle size
    if (cameraHeight > 10000000) { // Arbitrary threshold for high altitude
      // Cap the rectangle size to cover a reasonable portion of the Earth
      deltaLat = 10;  // Limit to a 10-degree latitude span (roughly 1110 km)
      deltaLon = 10;  // Limit to a 10-degree longitude span (roughly 1110 km)
    }

    // Calculate the Field of View (FOV) of the camera
    const fov = camera.frustum instanceof PerspectiveFrustum ? camera.frustum.fov : Math.PI / 3; // Default FOV if not PerspectiveFrustum

    // Apply zoom scaling based on camera height and FOV
    let zoomFactor = 1.0;

    if (cameraHeight < 500000) {
      zoomFactor = 0.05; // Strong zoom-out effect for very zoomed-in views (zoom 14+)
    } else if (cameraHeight < 2000000) {
      zoomFactor = 0.1; // Moderate zoom scaling for zoom levels 12-13
    }

    // Apply zoom factor based on the camera's FOV and height to reduce large areas
    deltaLat *= zoomFactor * (fov / Math.PI);  // FOV scaling adjusts the rectangle size
    deltaLon *= zoomFactor * (fov / Math.PI);  // Apply similar scaling to longitude

    // Factor in the tilt angle to scale the rectangle
    const cameraPitch = camera.pitch; // The pitch (tilt) of the camera
    const maxTiltAngle = Math.PI / 4; // Example of max tilt threshold (45 degrees)
    const tiltFactor = Math.max(0, 1 - (Math.abs(cameraPitch) / maxTiltAngle));

    // Apply the tilt factor to reduce the green rectangle size at sharp tilt angles
    deltaLat *= tiltFactor;
    deltaLon *= tiltFactor;

    // Calculate the new boundaries for the green rectangle
    let minLat = centerCartographic.latitude - deltaLat;
    let maxLat = centerCartographic.latitude + deltaLat;
    const minLon = centerCartographic.longitude - deltaLon;
    const maxLon = centerCartographic.longitude + deltaLon;

    // Apply a minimum size threshold to prevent the green rectangle from becoming invisible
    const minSize = 0.0005; // This threshold value prevents the rectangle from shrinking too much

    // Ensure the green rectangle doesn't shrink below the minimum size
    deltaLat = Math.max(deltaLat, minSize);
    deltaLon = Math.max(deltaLon, minSize);

    // Calculate the new boundaries after applying the minimum size
    const minLatClamped = centerCartographic.latitude - deltaLat;
    const maxLatClamped = centerCartographic.latitude + deltaLat;
    const minLonClamped = centerCartographic.longitude - deltaLon;
    const maxLonClamped = centerCartographic.longitude + deltaLon;

    if (!fullRect) return;
    // Clamp the new green rectangle to the full view rectangle (red rectangle)
    const clampedMinLat = CesiumMath.clamp(minLatClamped, fullRect.south, fullRect.north);
    const clampedMaxLat = CesiumMath.clamp(maxLatClamped, fullRect.south, fullRect.north);
    const clampedMinLon = CesiumMath.clamp(minLonClamped, fullRect.west, fullRect.east);
    const clampedMaxLon = CesiumMath.clamp(maxLonClamped, fullRect.west, fullRect.east);

    // Reduce the upper boundary more as the pitch increases (horizon visible)
    const pitchAdjustment = Math.min(1.0, cameraPitch / CesiumMath.PI_OVER_TWO); // Normalize pitch to [0, 1]
    const reducedMaxLat = fullRect.north - (fullRect.north - fullRect.south) * pitchAdjustment;

    // Adjust maxLat after the pitch adjustment
    const finalMaxLat = Math.min(clampedMaxLat, reducedMaxLat);

    // Return the new rectangle after ensuring it's within bounds
    return new Rectangle(
      CesiumMath.negativePiToPi(clampedMinLon),
      CesiumMath.clamp(clampedMinLat, -CesiumMath.PI_OVER_TWO, CesiumMath.PI_OVER_TWO),
      CesiumMath.negativePiToPi(clampedMaxLon),
      CesiumMath.clamp(finalMaxLat, -CesiumMath.PI_OVER_TWO, CesiumMath.PI_OVER_TWO)
    );
  };
  
  const fetchAndUpdateWfs = useCallback(async (offset = 0) => {
    if (!mapViewer) return;

    // const bbox = mapViewer.camera.computeViewRectangle(Ellipsoid.WGS84);
    const bbox = computeLimitedViewRectangle();
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
      wfsResponse.features[0].geometry = {
        "coordinates": [
          35.28895116556291,
          32.61102641988899
        ],
        "type": "Point"
      };
      wfsResponse.features[1].geometry = {
        "coordinates": [
          [
            35.287724347487654,
            32.61110591282352
          ],
          [
            35.28885679494161,
            32.6097677723582
          ],
          [
            35.291750827322375,
            32.60860185149416
          ]
        ],
        "type": "LineString"
      };
      console.log('WFS response:', wfsResponse);
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
