import { Story, Meta } from '@storybook/react/types-6-0';
import { CesiumMap, CesiumViewer } from '../map';
import { LayerType } from '../layers-manager';
import { CesiumWFSLayer, ICesiumWFSLayerLabelTextField } from './wfs.layer';
import { Cesium3DTileset } from './3d.tileset';
import { BBox } from 'geojson';
import area from '@turf/area';
import intersect from '@turf/intersect';
import centroid from '@turf/centroid';
import { Feature, Polygon, Properties } from '@turf/helpers';
import * as turf from '@turf/helpers';
import bboxPolygon from '@turf/bbox-polygon';
import {
  CesiumMath,
  CesiumSceneMode,
  CesiumGeoJsonDataSource,
  CesiumCesiumPolygonGraphics,
  CesiumCesiumEntity,
  CesiumColor,
  CesiumCesiumPolylineGraphics,
  CesiumCartesian3,
  CesiumJulianDate,
  CesiumCartographic,
  CesiumPositionProperty,
  CesiumCesiumBillboardGraphics,
  CesiumVerticalOrigin,
  CesiumHeightReference,
  CesiumPolygonHierarchy,
  CesiumCartesian2,
  CesiumScene,
  CesiumSceneTransforms,
  CesiumEllipsoid,
} from '../proxied.types';
import { getValue } from '../../utils/config';
import { useRef, useState } from 'react';

export default {
  title: 'Cesium Map/Layers/WFSLayer',
  component: CesiumWFSLayer,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta;

const mapDivStyle = {
  height: '100%',
  width: '100%',
  position: 'absolute' as const,
};

const BASE_MAPS = {
  maps: [
    {
      id: '1st',
      title: '1st Map Title',
      isCurrent: true,
      thumbnail: 'https://nsw.digitaltwin.terria.io/build/efa2f6c408eb790753a9b5fb2f3dc678.png',
      baseRasteLayers: [
        {
          id: 'GOOGLE_TERRAIN',
          type: 'XYZ_LAYER' as LayerType,
          opacity: 1,
          zIndex: 0,
          options: {
            url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
            layers: '',
            credit: 'GOOGLE',
          },
        },
      ],
      baseVectorLayers: [],
    },
  ],
};

const DEBUG_PANEL = {
  wfs: {},
};

const POINT_STROKE = '#FFFF00';
const BRIGHT_GREEN = '#01FF1F';
const LIGHT_BLUE = '#24AEE9';
const BRIGHT_PURPLE = '#b734eb';

// #region STORY PP component
export const MapWithPPWFSLayer: Story = (args: Record<string, unknown>) => {
  return (
    <div style={mapDivStyle}>
      <div style={{ zIndex: 2, color: 'white', position: 'fixed', paddingLeft: '50%', backgroundColor: 'black', width: '100%' }}>Go to ME</div>
      <CesiumMap {...args} sceneMode={CesiumSceneMode.SCENE2D}>
        <CesiumWFSLayer
          key={metaPolygonParts.id}
          options={optionsPolygonParts}
          meta={metaPolygonParts}
          visualizationHandler={handleVisualizationPolygonParts}
        />
      </CesiumMap>
    </div>
  );
};

MapWithPPWFSLayer.argTypes = {
  baseMaps: {
    defaultValue: BASE_MAPS,
  },
  zoom: {
    defaultValue: 17,
    control: {
      type: 'range',
      min: 0,
      max: 20,
    },
  },
  debugPanel: {
    defaultValue: DEBUG_PANEL,
  },
};

MapWithPPWFSLayer.storyName = 'WFS PP layer';
// #endregion

// #region STORY VECTOR component (NO VISUALIZER)
export const MapWithWFSLayer: Story = (args: Record<string, unknown>) => {
  return (
    <div style={mapDivStyle}>
      <CesiumMap {...args} sceneMode={CesiumSceneMode.SCENE2D}>
        <Cesium3DTileset isZoomTo={true} url={getValue(MapWithWFSLayer.storyName as string, '3d_model')} />
        <CesiumWFSLayer
          key={metaBuildings.id}
          options={optionsBuildings}
          meta={metaBuildings}
          // visualizationHandler={handleVisualizationBuildings}
        />
        {/* <CesiumWFSLayer
          key={metaBuildings.id + '_2'}
          options={optionsBuildings}
          meta={{ ...metaBuildings, id: metaBuildings.id + '_2' }}
          visualizationHandler={handleVisualizationBuildings}
        /> */}
      </CesiumMap>
    </div>
  );
};

MapWithWFSLayer.argTypes = {
  baseMaps: {
    defaultValue: BASE_MAPS,
  },
  zoom: {
    defaultValue: 17,
    control: {
      type: 'range',
      min: 0,
      max: 20,
    },
  },
  debugPanel: {
    defaultValue: DEBUG_PANEL,
  },
};

MapWithWFSLayer.storyName = 'WFS Vector layer';
// #endregion

// #region STORY VECTOR APP SCENARIO component (NO VISUALIZER)
export const MapWithWFSLayerAPPScenario: Story = (args: Record<string, unknown>) => {
  const show = useRef(false);

  function MyWFSLayer() {
    const [show, setShow] = useState(false);
    return (
      <>
        <input
          type="button"
          onClick={() => {
            setShow(!show);
          }}
          value={`SHOW WFS LAYER (${show})`}
          style={{ zIndex: '2', position: 'absolute' }}
        ></input>
        {/* <input type='button' onClick={()=>{ show.current = !show.current;}} value={`SHOW WFS LAYER (${show.current})`} style={{zIndex: "2", position: "absolute"}}></input> */}
        {show && (
          <CesiumWFSLayer
            key={metaBuildings.id}
            options={optionsBuildings}
            meta={metaBuildings}
            // visualizationHandler={handleVisualizationBuildings}
          />
        )}
      </>
    );
  }

  return (
    <div style={mapDivStyle}>
      <CesiumMap {...args} center={[35.0386, 32.77675]} sceneMode={CesiumSceneMode.SCENE2D}>
        <Cesium3DTileset isZoomTo={false} url={getValue(MapWithWFSLayer.storyName as string, '3d_model')} />
        <MyWFSLayer></MyWFSLayer>
      </CesiumMap>
    </div>
  );
};

MapWithWFSLayerAPPScenario.argTypes = {
  baseMaps: {
    defaultValue: BASE_MAPS,
  },
  zoom: {
    defaultValue: 17,
    control: {
      type: 'range',
      min: 0,
      max: 20,
    },
  },
  debugPanel: {
    defaultValue: DEBUG_PANEL,
  },
};

MapWithWFSLayerAPPScenario.storyName = 'WFS Vector layer(APP Scenario)';
// #endregion

// #region STORY VECTOR component (CUSTOM VISUALIZER)
export const MapWithWFSLayerWithVisualizer: Story = (args: Record<string, unknown>) => {
  return (
    <div style={mapDivStyle}>
      <CesiumMap {...args} sceneMode={CesiumSceneMode.SCENE2D}>
        <Cesium3DTileset isZoomTo={true} url={getValue(MapWithWFSLayerWithVisualizer.storyName as string, '3d_model')} />
        <CesiumWFSLayer key={metaBuildings.id} options={optionsBuildings} meta={metaBuildings} visualizationHandler={handleVisualizationBuildings} />
      </CesiumMap>
    </div>
  );
};

MapWithWFSLayerWithVisualizer.argTypes = {
  baseMaps: {
    defaultValue: BASE_MAPS,
  },
  zoom: {
    defaultValue: 17,
    control: {
      type: 'range',
      min: 0,
      max: 20,
    },
  },
  debugPanel: {
    defaultValue: DEBUG_PANEL,
  },
};

MapWithWFSLayerWithVisualizer.storyName = 'WFS Vector layer (Visual)';
// #endregion

// #region polygonParts

const optionsPolygonParts = {
  url: getValue(MapWithPPWFSLayer.storyName as string, 'raster_pp_geoserver'),
  featureType: 'polygonParts:ME_UPDATE_TESTS-Orthophoto',
  style: {
    color: BRIGHT_GREEN,
    hover: LIGHT_BLUE,
  },
  pageSize: 300,
  zoomLevel: 7,
  maxCacheSize: 6000,
  keyField: 'id',
  labeling: {
    dataSourcePrefix: 'labels_',
    text: {
      pattern: '${imagingTimeEndUTC}\n v${productVersion} (${resolutionDegree})',
      fields: [
        {
          name: 'imagingTimeEndUTC',
          type: 'date',
          format: 'dd/MM/yyyy',
        },
        {
          name: 'productVersion',
          type: 'string',
        },
        {
          name: 'resolutionDegree',
          type: 'number',
          predicate: (value) => {
            const zoomlevelresolutions = [
              {
                value: '0',
                translationCode: '0',
                properties: {
                  resolutionDeg: 0.703125,
                  resolutionMeter: 78271.52,
                },
              },
              {
                value: '1',
                translationCode: '1',
                properties: {
                  resolutionDeg: 0.3515625,
                  resolutionMeter: 39135.76,
                },
              },
              {
                value: '2',
                translationCode: '2',
                properties: {
                  resolutionDeg: 0.17578125,
                  resolutionMeter: 19567.88,
                },
              },
              {
                value: '3',
                translationCode: '3',
                properties: {
                  resolutionDeg: 0.087890625,
                  resolutionMeter: 9783.94,
                },
              },
              {
                value: '4',
                translationCode: '4',
                properties: {
                  resolutionDeg: 0.0439453125,
                  resolutionMeter: 4891.97,
                },
              },
              {
                value: '5',
                translationCode: '5',
                properties: {
                  resolutionDeg: 0.02197265625,
                  resolutionMeter: 2445.98,
                },
              },
              {
                value: '6',
                translationCode: '6',
                properties: {
                  resolutionDeg: 0.010986328125,
                  resolutionMeter: 1222.99,
                },
              },
              {
                value: '7',
                translationCode: '7',
                properties: {
                  resolutionDeg: 0.0054931640625,
                  resolutionMeter: 611.5,
                },
              },
              {
                value: '8',
                translationCode: '8',
                properties: {
                  resolutionDeg: 0.00274658203125,
                  resolutionMeter: 305.75,
                },
              },
              {
                value: '9',
                translationCode: '9',
                properties: {
                  resolutionDeg: 0.001373291015625,
                  resolutionMeter: 152.87,
                },
              },
              {
                value: '10',
                translationCode: '10',
                properties: {
                  resolutionDeg: 0.0006866455078125,
                  resolutionMeter: 76.44,
                },
              },
              {
                value: '11',
                translationCode: '11',
                properties: {
                  resolutionDeg: 0.00034332275390625,
                  resolutionMeter: 38.22,
                },
              },
              {
                value: '12',
                translationCode: '12',
                properties: {
                  resolutionDeg: 0.000171661376953125,
                  resolutionMeter: 19.11,
                },
              },
              {
                value: '13',
                translationCode: '13',
                properties: {
                  resolutionDeg: 0.0000858306884765625,
                  resolutionMeter: 9.55,
                },
              },
              {
                value: '14',
                translationCode: '14',
                properties: {
                  resolutionDeg: 0.0000429153442382812,
                  resolutionMeter: 4.78,
                },
              },
              {
                value: '15',
                translationCode: '15',
                properties: {
                  resolutionDeg: 0.0000214576721191406,
                  resolutionMeter: 2.39,
                },
              },
              {
                value: '16',
                translationCode: '16',
                properties: {
                  resolutionDeg: 0.0000107288360595703,
                  resolutionMeter: 1.19,
                },
              },
              {
                value: '17',
                translationCode: '17',
                properties: {
                  resolutionDeg: 0.00000536441802978516,
                  resolutionMeter: 0.6,
                },
              },
              {
                value: '18',
                translationCode: '18',
                properties: {
                  resolutionDeg: 0.00000268220901489258,
                  resolutionMeter: 0.3,
                },
              },
              {
                value: '19',
                translationCode: '19',
                properties: {
                  resolutionDeg: 0.00000134110450744629,
                  resolutionMeter: 0.15,
                },
              },
              {
                value: '20',
                translationCode: '20',
                properties: {
                  resolutionDeg: 6.70552253723145e-7,
                  resolutionMeter: 0.075,
                },
              },
              {
                value: '21',
                translationCode: '21',
                properties: {
                  resolutionDeg: 3.35276126861572e-7,
                  resolutionMeter: 0.037,
                },
              },
              {
                value: '22',
                translationCode: '22',
                properties: {
                  resolutionDeg: 1.67638063430786e-7,
                  resolutionMeter: 0.0185,
                },
              },
            ];
            const res = zoomlevelresolutions.find((res) => res.properties.resolutionDeg === value);
            return res ? res.value : 'N/A';
          },
        },
      ] as ICesiumWFSLayerLabelTextField[],
    },
    fontName: 'sans-serif',
    fontSize: 14,
    padding: 4,
    fillStyle: 'white',
    strokeStyle: 'black',
    lineWidth: 3,
  },
};

const metaPolygonParts = {
  id: '00000000',
  keywords: 'PolygonParts',
  links: 'cyprus,,WFS,https://raster-pp-serving', // RASTER PP
  type: 'RECORD_VECTOR',
  classification: '5',
  productName: 'בדיקות עדכון',
  description: 'PolygonParts layer',
  srsId: '4326',
  srsName: '4326',
  producerName: 'IDFMU',
  footprint: '{"type":"Polygon","coordinates":[[[-180,-90],[180,-90],[180,90],[-180,90],[-180,-90]]]}',
  productType: 'VECTOR_BEST',
  featureStructure: {
    layerName: 'polygonParts:layer',
    aliasLayerName: 'בדיקות עדכון',
    fields: [
      {
        fieldName: 'id',
        aliasFieldName: 'id',
        type: 'String',
      },
      {
        fieldName: 'catalogId',
        aliasFieldName: 'catalogId',
        type: 'String',
      },
      {
        fieldName: 'productId',
        aliasFieldName: 'productId',
        type: 'String',
      },
      {
        fieldName: 'productType',
        aliasFieldName: 'productType',
        type: 'String',
      },
      {
        fieldName: 'sourceId',
        aliasFieldName: 'sourceId',
        type: 'String',
      },
      {
        fieldName: 'sourceName',
        aliasFieldName: 'sourceName',
        type: 'String',
      },
      {
        fieldName: 'productVersion',
        aliasFieldName: 'productVersion',
        type: 'String',
      },
      {
        fieldName: 'ingestionDateUTC',
        aliasFieldName: 'ingestionDateUTC',
        type: 'Date',
      },
      {
        fieldName: 'imagingTimeBeginUTC',
        aliasFieldName: 'imagingTimeBeginUTC',
        type: 'Date',
      },
      {
        fieldName: 'imagingTimeEndUTC',
        aliasFieldName: 'imagingTimeEndUTC',
        type: 'Date',
      },
      {
        fieldName: 'resolutionDegree',
        aliasFieldName: 'resolutionDegree',
        type: 'Number',
      },
      {
        fieldName: 'resolutionMeter',
        aliasFieldName: 'resolutionMeter',
        type: 'Number',
      },
      {
        fieldName: 'sourceResolutionMeter',
        aliasFieldName: 'sourceResolutionMeter',
        type: 'Number',
      },
      {
        fieldName: 'horizontalAccuracyCe90',
        aliasFieldName: 'horizontalAccuracyCe90',
        type: 'Number',
      },
      {
        fieldName: 'sensors',
        aliasFieldName: 'sensors',
        type: 'String',
      },
      {
        fieldName: 'countries',
        aliasFieldName: 'countries',
        type: 'String',
      },
      {
        fieldName: 'cities',
        aliasFieldName: 'cities',
        type: 'String',
      },
      {
        fieldName: '_description',
        aliasFieldName: 'description',
        type: 'String',
      },
    ],
  },
};

const handleVisualizationPolygonParts = (
  mapViewer: CesiumViewer,
  dataSource: CesiumGeoJsonDataSource,
  processEntityIds: string[],
  extent?: BBox
): void => {
  const is2D = mapViewer.scene.mode === CesiumSceneMode.SCENE2D;

  const getGeoJsonFromEntity = (entity: CesiumCesiumEntity): Polygon | undefined => {
    if (entity.polygon) {
      // Polygon
      const polygonData = entity.polygon.hierarchy?.getValue(CesiumJulianDate.now()) as CesiumPolygonHierarchy;
      const positions = polygonData.positions.map((position) => {
        const worlPosCartographic = CesiumCartographic.fromCartesian(position);
        const correctedCarto = new CesiumCartographic(
          CesiumMath.toDegrees(worlPosCartographic.longitude),
          CesiumMath.toDegrees(worlPosCartographic.latitude),
          is2D ? 500 : undefined //mapViewer.scene.sampleHeight(CesiumCartographic.fromCartesian(position))
        );
        return [correctedCarto.longitude, correctedCarto.latitude, correctedCarto.height];
      });

      return {
        type: 'Polygon',
        coordinates: [positions],
      };
    }
  };

  const pixelSizeInMeters = (
    scene: CesiumScene,
    position: CesiumCartesian3,
    pixelWidth: number,
    pixelHeight: number
  ): { widthMeters: number; heightMeters: number } | null => {
    const screenPosition = CesiumSceneTransforms.wgs84ToWindowCoordinates(scene, position);

    if (!screenPosition) return null;

    const xRight = screenPosition.x + pixelWidth;
    const yBottom = screenPosition.y + pixelHeight;

    const screenRight = new CesiumCartesian2(xRight, screenPosition.y);
    const screenBottom = new CesiumCartesian2(screenPosition.x, yBottom);

    const worldRight = scene.camera.pickEllipsoid(screenRight, scene.globe.ellipsoid);
    const worldBottom = scene.camera.pickEllipsoid(screenBottom, scene.globe.ellipsoid);

    if (!worldRight || !worldBottom) return null;

    const widthMeters = CesiumCartesian3.distance(position, worldRight);
    const heightMeters = CesiumCartesian3.distance(position, worldBottom);

    return { widthMeters, heightMeters };
  };

  const createRectangleAround = (centerCartographic: { longitude: number; latitude: number }, widthMeters: number, heightMeters: number): Polygon => {
    const ellipsoid = CesiumEllipsoid.WGS84;
    const lat = centerCartographic.latitude;
    const lon = centerCartographic.longitude;

    const metersPerDegreeLat = (Math.PI / 180) * ellipsoid.maximumRadius;
    const metersPerDegreeLon = (Math.PI / 180) * ellipsoid.maximumRadius; /** Math.cos(lat)*/

    const dLat = heightMeters / 2 / metersPerDegreeLat;
    const dLon = widthMeters / 2 / metersPerDegreeLon;

    const north = lat + dLat;
    const south = lat - dLat;
    const east = lon + dLon;
    const west = lon - dLon;

    return {
      type: 'Polygon',
      coordinates: [
        [
          [west, north],
          [east, north],
          [east, south],
          [west, south],
          [west, north], // close the ring
        ],
      ],
    };
  };

  const calcIntersectionRation = (polygon1: turf.Geometry, polygon2: turf.Geometry) => {
    return area(polygon1) / area(polygon2);
  };

  const getCategorizedColor = (res: number): string => {
    const catColor = categoriesColorPalete.find((item) => {
      return res >= item.minRes && res <= item.maxRes;
    });
    return catColor ? catColor.color : BRIGHT_GREEN;
  };

  const categoriesColorPalete = [
    {
      minRes: 1.67638063430786e-7, // 22
      maxRes: 0.00000268220901489258, // 18
      color: '#01FF1F', // BRIGHT_GREEN
    },
    {
      minRes: 0.00000536441802978516, // 17
      maxRes: 0.0000107288360595703, // 16
      color: '#fbff01', // BRIGHT_YELLOW
    },
    {
      minRes: 0.0000214576721191406, // 15
      maxRes: 0.703125, // 0
      color: '#ff3401', // BRIGHT_RED
    },
  ];

  const labelPos = [] as turf.Feature<turf.Point>[];

  dataSource?.entities.values.forEach((entity: CesiumCesiumEntity) => {
    if (extent && is2D) {
      try {
        const extentPolygon = bboxPolygon(extent);
        const featureClippedPolygon = intersect(getGeoJsonFromEntity(entity) as Polygon, extentPolygon) as Feature<Polygon, Properties>;
        if (featureClippedPolygon) {
          const labelValue = entity.properties?.label.getValue(CesiumJulianDate.now());
          const featureClippedPolygonCenter = centroid(featureClippedPolygon as unknown as Polygon, {
            properties: {
              label: labelValue,
            },
          });

          const labelPixelSize = { width: labelValue.width, height: labelValue.height };
          const [longitude, latitude, height = 0] = featureClippedPolygonCenter.geometry.coordinates;
          const cartesian = CesiumCartesian3.fromDegrees(longitude, latitude, height);
          const sizeMeters = pixelSizeInMeters(mapViewer.scene, cartesian, labelPixelSize.width, labelPixelSize.height);

          if (sizeMeters) {
            const labelRect = createRectangleAround({ longitude, latitude }, sizeMeters.widthMeters, sizeMeters.heightMeters);

            const labelIntersection = intersect(featureClippedPolygon, {
              type: 'Feature',
              properties: {},
              geometry: labelRect,
            });
            const intersectionRatio = calcIntersectionRation(labelIntersection?.geometry as turf.Geometry, labelRect);
            if (intersectionRatio > 0.7) {
              labelPos.push(featureClippedPolygonCenter);
            }
          }
        }
      } catch (e) {
        console.log('*** Label placement failed: turf.intersect() failed ***', 'entity -->', entity, 'extent -->', extent);
      }
    }
    if (processEntityIds.length > 0 && !processEntityIds.some((validId) => entity.id.startsWith(validId))) {
      return;
    }
    if (entity.polygon) {
      const partResolution = entity.properties?.resolutionDegree.getValue(CesiumJulianDate.now());
      const partColor = getCategorizedColor(partResolution);
      entity.polygon = new CesiumCesiumPolygonGraphics({
        hierarchy: entity.polygon.hierarchy,
        material: is2D ? CesiumColor.fromCssColorString(partColor).withAlpha(0.2) : CesiumColor.fromCssColorString(partColor).withAlpha(0.5),
        outline: true,
        outlineColor: CesiumColor.fromCssColorString(partColor),
        outlineWidth: 3,
        height: is2D ? 10000 : undefined, // Mount Everest peak reaches an elevation of approximately 8848.86 meters above sea level
        perPositionHeight: false,
      });
    }
    if (entity.polyline) {
      entity.polyline = new CesiumCesiumPolylineGraphics({
        positions: entity.polyline.positions,
        material: CesiumColor.fromCssColorString(BRIGHT_GREEN).withAlpha(0.5),
        clampToGround: true,
        width: 4,
      });
    }
    if (entity.billboard) {
      const worldPos = entity.position?.getValue(CesiumJulianDate.now()) as CesiumCartesian3;
      const worlPosCartographic = CesiumCartographic.fromCartesian(worldPos);
      const correctedCarto = new CesiumCartographic(
        worlPosCartographic.longitude,
        worlPosCartographic.latitude,
        is2D ? 500 : mapViewer.scene.sampleHeight(CesiumCartographic.fromCartesian(worldPos))
      );

      // Convert back to Cartesian3
      const correctedCartesian = CesiumCartesian3.fromRadians(correctedCarto.longitude, correctedCarto.latitude, correctedCarto.height);

      entity.position = correctedCartesian as unknown as CesiumPositionProperty;

      entity.billboard = new CesiumCesiumBillboardGraphics({
        image:
          'data:image/svg+xml;base64,' +
          btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
            <circle cx="8" cy="8" r="6" fill="${BRIGHT_GREEN}33" stroke="${POINT_STROKE}80" stroke-width="2"/>
          </svg>
        `), //${BRIGHT_GREEN}33 - with opacity 0.2 ; #FFFF0080 - with opacity 0.5
        verticalOrigin: CesiumVerticalOrigin.BOTTOM,
        heightReference: CesiumHeightReference.NONE, // Ensures it's not clamped and floats above
        scale: 1.0,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      });
    }
  });

  const labelsCollectionName = `labels_${dataSource.name}`;
  const deselectLabelEntities = (entity: CesiumCesiumEntity) => {
    //@ts-ignore
    if (entity && entity.entityCollection.owner.name === labelsCollectionName) {
      mapViewer.selectedEntity = undefined;
    }
  };

  mapViewer.dataSources.remove(mapViewer.dataSources.getByName(labelsCollectionName)[0]);
  mapViewer.selectedEntityChanged.removeEventListener(deselectLabelEntities);
  if (is2D) {
    const labelsGeoJsonDataSource = new CesiumGeoJsonDataSource(labelsCollectionName);
    mapViewer.dataSources.add(labelsGeoJsonDataSource);

    // Disable click on labels
    mapViewer.selectedEntityChanged.addEventListener(deselectLabelEntities);

    labelsGeoJsonDataSource
      .load({
        type: 'FeatureCollection',
        features: labelPos,
      })
      .then((dataSource) => {
        dataSource?.entities.values.forEach((entity: CesiumCesiumEntity) => {
          const worldPos = entity.position?.getValue(CesiumJulianDate.now()) as CesiumCartesian3;
          const worlPosCartographic = CesiumCartographic.fromCartesian(worldPos);
          const correctedCarto = new CesiumCartographic(
            worlPosCartographic.longitude,
            worlPosCartographic.latitude,
            is2D ? 500 : mapViewer.scene.sampleHeight(CesiumCartographic.fromCartesian(worldPos))
          );

          const correctedCartesian = CesiumCartesian3.fromRadians(correctedCarto.longitude, correctedCarto.latitude, correctedCarto.height);

          entity.position = correctedCartesian as unknown as CesiumPositionProperty;

          entity.billboard = new CesiumCesiumBillboardGraphics({
            image: entity.properties?.label.getValue(CesiumJulianDate.now()).dataURL,
            heightReference: CesiumHeightReference.NONE, // Ensures it's not clamped and floats above
            scale: 1.0,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          });
        });
      });
  }
};

// #endregion

// #region buildings

const optionsBuildings = {
  url: getValue(MapWithWFSLayer.storyName as string, 'vector_geoserver'),
  featureType: 'buildings',
  style: {
    color: BRIGHT_GREEN,
    hover: LIGHT_BLUE,
  },
  pageSize: 300,
  zoomLevel: 14,
  maxCacheSize: 6000,
  keyField: 'id',
};

const metaBuildings = {
  id: '1111111',
  keywords: 'buildings, osm',
  links: 'buildings,,WFS,http://geoserver-vector',
  type: 'RECORD_VECTOR',
  classification: '5',
  productName: 'מבנים',
  description: 'Buildings layer',
  srsId: '4326',
  srsName: '4326',
  producerName: 'Moria',
  footprint: '{"type":"Polygon","coordinates":[[[-180,-90],[180,-90],[180,90],[-180,90],[-180,-90]]]}',
  productType: 'VECTOR_BEST',
  featureStructure: {
    layerName: 'buildings',
    aliasLayerName: 'מבנים',
    fields: [
      {
        fieldName: 'osm_id',
        aliasFieldName: 'מזהה OSM',
        type: 'String',
      },
      {
        fieldName: 'id',
        aliasFieldName: 'מזהה',
        type: 'String',
      },
      {
        fieldName: 'building_type',
        aliasFieldName: 'סוג',
        type: 'String',
      },
      {
        fieldName: 'sensitivity',
        aliasFieldName: 'רגישות',
        type: 'String',
      },
      {
        fieldName: 'entity_id',
        aliasFieldName: 'מזהה יישות',
        type: 'String',
      },
      {
        fieldName: 'is_sensitive',
        aliasFieldName: 'רגיש',
        type: 'Boolean',
      },
      {
        fieldName: 'date',
        aliasFieldName: 'תאריך',
        type: 'Date',
      },
    ],
  },
};

const handleVisualizationBuildings = (mapViewer: CesiumViewer, dataSource: CesiumGeoJsonDataSource, processEntityIds: string[]): void => {
  const is2D = mapViewer.scene.mode === CesiumSceneMode.SCENE2D;

  dataSource?.entities.values.forEach((entity: CesiumCesiumEntity) => {
    if (processEntityIds.length > 0 && !processEntityIds.some((validId) => entity.id.startsWith(validId))) {
      return;
    }
    if (entity.polygon) {
      entity.polygon = new CesiumCesiumPolygonGraphics({
        hierarchy: entity.polygon.hierarchy,
        material: is2D ? CesiumColor.fromCssColorString(BRIGHT_PURPLE).withAlpha(0.2) : CesiumColor.fromCssColorString(BRIGHT_PURPLE).withAlpha(0.5),
        outline: true,
        outlineColor: CesiumColor.fromCssColorString(BRIGHT_PURPLE),
        outlineWidth: 3,
        height: is2D ? 10000 : undefined, // Mount Everest peak reaches an elevation of approximately 8848.86 meters above sea level
        perPositionHeight: false,
      });
    }
    if (entity.polyline) {
      entity.polyline = new CesiumCesiumPolylineGraphics({
        positions: entity.polyline.positions,
        material: CesiumColor.fromCssColorString(BRIGHT_PURPLE).withAlpha(0.5),
        clampToGround: true,
        width: 4,
      });
    }
    if (entity.billboard) {
      const worldPos = entity.position?.getValue(CesiumJulianDate.now()) as CesiumCartesian3;
      const worlPosCartographic = CesiumCartographic.fromCartesian(worldPos);
      const correctedCarto = new CesiumCartographic(
        worlPosCartographic.longitude,
        worlPosCartographic.latitude,
        is2D ? 500 : mapViewer.scene.sampleHeight(CesiumCartographic.fromCartesian(worldPos))
      );

      const correctedCartesian = CesiumCartesian3.fromRadians(correctedCarto.longitude, correctedCarto.latitude, correctedCarto.height);

      entity.position = correctedCartesian as unknown as CesiumPositionProperty;

      entity.billboard = new CesiumCesiumBillboardGraphics({
        image:
          'data:image/svg+xml;base64,' +
          btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
            <circle cx="8" cy="8" r="6" fill="${BRIGHT_PURPLE}33" stroke="${POINT_STROKE}80" stroke-width="2"/>
          </svg>
        `), //${BRIGHT_PURPLE}33 - with opacity 0.2 ; #FFFF0080 - with opacity 0.5
        verticalOrigin: CesiumVerticalOrigin.BOTTOM,
        heightReference: CesiumHeightReference.NONE, // Ensures it's not clamped and floats above
        scale: 1.0,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      });
    }
  });
};

// #endregion
