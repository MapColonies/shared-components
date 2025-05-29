import {
  BillboardGraphics,
  Cartesian3,
  Cartographic,
  CesiumTerrainProvider,
  Entity,
  GeoJsonDataSource,
  HeightReference,
  JulianDate,
  PolygonGraphics,
  PolylineGraphics,
  PositionProperty,
  SceneMode,
  VerticalOrigin,
} from 'cesium';
import { Story, Meta } from '@storybook/react/types-6-0';
import { BASE_MAPS } from '../helpers/constants';
import { CesiumMap, CesiumViewer } from '../map';
import { CesiumColor } from '../proxied.types';
import { CesiumWFSLayer } from './wfs.layer';
import { Cesium3DTileset } from './3d.tileset';

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

const DEFAULT_TERRAIN_PROVIDER_URL = 'https://dem-nginx-s3-gateway-route-manual-integration.apps.j1lk3njp.eastus.aroapp.io/terrains/srtm100?token=eyJhbGciOiJSUzI1NiIsImtpZCI6Im1hcC1jb2xvbmllcy1pbnQifQ.eyJkIjpbInJhc3RlciIsInJhc3RlcldtcyIsInJhc3RlckV4cG9ydCIsImRlbSIsInZlY3RvciIsIjNkIl0sImlhdCI6MTY3NDYzMjM0Niwic3ViIjoibWFwY29sb25pZXMtYXBwIiwiaXNzIjoibWFwY29sb25pZXMtdG9rZW4tY2xpIn0.D1u28gFlxf_Z1bzIiRHZonUgrdWwhZy8DtmQj15cIzaABRUrGV2n_OJlgWTuNfrao0SbUZb_s0_qUUW6Gz_zO3ET2bVx5xQjBu0CaIWdmUPDjEYr6tw-eZx8EjFFIyq3rs-Fo0daVY9cX1B2aGW_GeJir1oMnJUURhABYRoh60azzl_utee9UdhDpnr_QElNtzJZIKogngsxCWp7tI7wkTuNCBaQM7aLEcymk0ktxlWEAt1E0nGt1R-bx-HnPeeQyZlxx4UQ1nuYTijpz7N8poaCCExOFeafj9T7megv2BzTrKWgfM1eai8srSgNa3I5wKuW0EyYnGZxdbJe8aseZg';

const DEBUG_PANEL = {
  wfs: {},
};

const POINT_STROKE = '#FFFF00';

// #region buildings

const BRIGHT_GREEN = '#01FF1F';
const LIGHT_BLUE = '#24AEE9';

const optionsBuildings = {
  url: 'http://geoserver-vector-dev.apps.j1lk3njp.eastus.aroapp.io/geoserver/core/ows',
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
  links: 'buildings,,WFS,http://geoserver-vector-dev.apps.j1lk3njp.eastus.aroapp.io/geoserver/core/ows',
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
        fieldName: 'OSM_ID',
        aliasFieldName: 'מזהה OSM',
        type: 'String',
      },
      {
        fieldName: 'ID',
        aliasFieldName: 'מזהה',
        type: 'String',
      },
      {
        fieldName: 'BUILDING_TYPE',
        aliasFieldName: 'סוג',
        type: 'String',
      },
      {
        fieldName: 'SENSITIVITY',
        aliasFieldName: 'רגישות',
        type: 'String',
      },
      {
        fieldName: 'ENTITY_ID',
        aliasFieldName: 'מזהה יישות',
        type: 'String',
      },
      {
        fieldName: 'IS_SENSITIVE',
        aliasFieldName: 'רגיש',
        type: 'Boolean',
      },
      {
        fieldName: 'DATE',
        aliasFieldName: 'תאריך',
        type: 'Date',
      },
    ],
  },
};

const handleVisualizationBuildings = (mapViewer: CesiumViewer, dataSource: GeoJsonDataSource, processEntityIds: string[]): void => {
  const is2D = mapViewer.scene.mode === SceneMode.SCENE2D;

  dataSource?.entities.values.forEach((entity: Entity) => {
    if (processEntityIds.length > 0 && !processEntityIds.some((validId) => entity.id.startsWith(validId))) {
      return;
    }
    if (entity.polygon) {
      entity.polygon = new PolygonGraphics({
        hierarchy: entity.polygon.hierarchy,
        material: is2D ? CesiumColor.fromCssColorString(BRIGHT_GREEN).withAlpha(0.2) : CesiumColor.fromCssColorString(BRIGHT_GREEN).withAlpha(0.5),
        outline: true,
        outlineColor: CesiumColor.fromCssColorString(BRIGHT_GREEN),
        outlineWidth: 3,
        height: is2D ? 10000 : undefined, // Mount Everest peak reaches an elevation of approximately 8848.86 meters above sea level
        perPositionHeight: false,
      });
    }
    if (entity.polyline) {
      entity.polyline = new PolylineGraphics({
        positions: entity.polyline.positions,
        material: CesiumColor.fromCssColorString(BRIGHT_GREEN).withAlpha(0.5),
        clampToGround: true,
        width: 4,
      });
    }
    if (entity.billboard) {
      const worldPos = entity.position?.getValue(JulianDate.now()) as Cartesian3;
      const worlPosCartographic = Cartographic.fromCartesian(worldPos);
      const correctedCarto = new Cartographic(
        worlPosCartographic.longitude,
        worlPosCartographic.latitude,
        is2D ? 500 : mapViewer.scene.sampleHeight(Cartographic.fromCartesian(worldPos))
      );

      // Convert back to Cartesian3
      const correctedCartesian = Cartesian3.fromRadians(correctedCarto.longitude, correctedCarto.latitude, correctedCarto.height);

      entity.position = correctedCartesian as unknown as PositionProperty;

      entity.billboard = new BillboardGraphics({
        image:
          'data:image/svg+xml;base64,' +
          btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
            <circle cx="8" cy="8" r="6" fill="${BRIGHT_GREEN}33" stroke="${POINT_STROKE}80" stroke-width="2"/>
          </svg>
        `), //${BRIGHT_GREEN}33 - with opacity 0.2 ; #FFFF0080 - with opacity 0.5
        verticalOrigin: VerticalOrigin.BOTTOM,
        heightReference: HeightReference.NONE, // Ensures it's not clamped and floats above
        scale: 1.0,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      });
    }
  });
};

// #endregion

// #region buildings_dates

const GREEN = '#00FF00';
const BLUE = '#0000FF';

const optionsBuildingsDates = {
  url: 'http://geoserver-vector-dev.apps.j1lk3njp.eastus.aroapp.io/geoserver/core/ows',
  featureType: 'buildings_dates',
  style: {
    color: GREEN,
    hover: BLUE,
  },
  pageSize: 300,
  zoomLevel: 14,
  maxCacheSize: 6000,
  keyField: 'year_day_numeric',
};

const metaBuildingsDates = {
  id: '2222222',
  keywords: 'buildings_dates, osm',
  links: 'buildings_dates,,WFS,http://geoserver-vector-dev.apps.j1lk3njp.eastus.aroapp.io/geoserver/core/ows',
  type: 'RECORD_VECTOR',
  classification: '5',
  productName: 'תאריכי מבנים',
  description: 'Buildings dates layer',
  srsId: '4326',
  srsName: '4326',
  producerName: 'Moria',
  footprint: '{"type":"Polygon","coordinates":[[[-180,-90],[180,-90],[180,90],[-180,90],[-180,-90]]]}',
  productType: 'VECTOR_BEST',
  featureStructure: {
    layerName: 'buildings_dates',
    aliasLayerName: 'תאריכי מבנים',
    fields: [
      {
        fieldName: 'OSM_ID',
        aliasFieldName: 'מזהה OSM',
        type: 'String',
      },
      {
        fieldName: 'ID',
        aliasFieldName: 'מזהה',
        type: 'String',
      },
      {
        fieldName: 'BUILDING_TYPE',
        aliasFieldName: 'סוג',
        type: 'String',
      },
      {
        fieldName: 'SENSITIVITY',
        aliasFieldName: 'רגישות',
        type: 'String',
      },
      {
        fieldName: 'ENTITY_ID',
        aliasFieldName: 'מזהה יישות',
        type: 'String',
      },
      {
        fieldName: 'IS_SENSITIVE',
        aliasFieldName: 'רגיש',
        type: 'Boolean',
      },
      {
        fieldName: 'DATE',
        aliasFieldName: 'תאריך',
        type: 'Date',
      },
    ],
  },
};

const handleVisualizationBuildingsDates = (mapViewer: CesiumViewer, dataSource: GeoJsonDataSource, processEntityIds: string[]): void => {
  const is2D = mapViewer.scene.mode === SceneMode.SCENE2D;

  dataSource?.entities.values.forEach((entity: Entity) => {
    if (processEntityIds.length > 0 && !processEntityIds.some((validId) => entity.id.startsWith(validId))) {
      return;
    }
    if (entity.polygon) {
      entity.polygon = new PolygonGraphics({
        hierarchy: entity.polygon.hierarchy,
        material: is2D ? CesiumColor.fromCssColorString(GREEN).withAlpha(0.2) : CesiumColor.fromCssColorString(GREEN).withAlpha(0.5),
        outline: true,
        outlineColor: CesiumColor.fromCssColorString(GREEN),
        outlineWidth: 3,
        height: is2D ? 10000 : undefined, // Mount Everest peak reaches an elevation of approximately 8848.86 meters above sea level
        perPositionHeight: false,
      });
    }
    if (entity.polyline) {
      entity.polyline = new PolylineGraphics({
        positions: entity.polyline.positions,
        material: CesiumColor.fromCssColorString(GREEN).withAlpha(0.5),
        clampToGround: true,
        width: 4,
      });
    }
    if (entity.billboard) {
      const worldPos = entity.position?.getValue(JulianDate.now()) as Cartesian3;
      const worlPosCartographic = Cartographic.fromCartesian(worldPos);
      const correctedCarto = new Cartographic(
        worlPosCartographic.longitude,
        worlPosCartographic.latitude,
        is2D ? 500 : mapViewer.scene.sampleHeight(Cartographic.fromCartesian(worldPos))
      );

      // Convert back to Cartesian3
      const correctedCartesian = Cartesian3.fromRadians(correctedCarto.longitude, correctedCarto.latitude, correctedCarto.height);

      entity.position = correctedCartesian as unknown as PositionProperty;

      entity.billboard = new BillboardGraphics({
        image:
          'data:image/svg+xml;base64,' +
          btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">
            <circle cx="8" cy="8" r="6" fill="${GREEN}33" stroke="${POINT_STROKE}80" stroke-width="2"/>
          </svg>
        `), //${GREEN}33 - with opacity 0.2 ; #FFFF0080 - with opacity 0.5
        verticalOrigin: VerticalOrigin.BOTTOM,
        heightReference: HeightReference.NONE, // Ensures it's not clamped and floats above
        scale: 1.0,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      });
    }
  });
};

// #endregion

export const MapWithWFSLayer: Story = (args: Record<string, unknown>) => {
  return (
    <div style={mapDivStyle}>
      <CesiumMap {...args} sceneMode={SceneMode.SCENE2D}>
        <Cesium3DTileset
          isZoomTo={true}
          url="https://3d.ofek-air.com/3d/Jeru_Old_City_Cesium/ACT/Jeru_Old_City_Cesium_ACT.json"
        />
        <CesiumWFSLayer
          key={metaBuildings.id}
          options={optionsBuildings}
          meta={metaBuildings}
          visualizationHandler={handleVisualizationBuildings}
        />
        {/* <CesiumWFSLayer
          key={metaBuildings.id + '_2'}
          options={optionsBuildings}
          meta={{ ...metaBuildings, id: metaBuildings.id + '_2' }}
          visualizationHandler={handleVisualizationBuildings}
        />
        <CesiumWFSLayer
          key={metaBuildings.id + '_3'}
          options={optionsBuildings}
          meta={{ ...metaBuildings, id: metaBuildings.id + '_3' }}
          visualizationHandler={handleVisualizationBuildings}
        />
        <CesiumWFSLayer
          key={metaBuildingsDates.id}
          options={optionsBuildingsDates}
          meta={metaBuildingsDates}
          visualizationHandler={handleVisualizationBuildingsDates}
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
  terrainProvider: {
    defaultValue: new CesiumTerrainProvider({ url: DEFAULT_TERRAIN_PROVIDER_URL }),
  },
};

MapWithWFSLayer.storyName = 'WFS layer';
