import {
  ArcGISTiledElevationTerrainProvider,
  ImageryLayer,
  UrlTemplateImageryProvider,
  TerrainProvider
} from 'cesium';
import { useState, useEffect } from 'react';
import type { StoryFn, Meta } from '@storybook/react';
import { action } from 'storybook/actions';
import { getValue } from '../../utils/config';
import { BASE_MAPS } from '../helpers/constants';
import { ICesiumImageryLayerMeta } from '../layers-manager';
import { CesiumMap } from '../map';
import { CesiumImageryLayer } from './imagery.layer';
import { Cesium3DTileset } from './3d.tileset';

export default {
  title: 'Cesium Map/Layers/3DTileset',
  component: Cesium3DTileset,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta;

const mapDivStyle = {
  height: '100%',
  width: '100%',
  position: 'absolute' as const,
};

const layerManagerMetaMapping = {
  layer: {
    id: 'id',
    name: 'layerRecord.productName',
  },
};

const ARCGIS_TERRAIN_URL = 'https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer';

const useArcGisTerrainProvider = (): TerrainProvider | undefined => {
  const [provider, setProvider] = useState<TerrainProvider | undefined>(undefined);
  useEffect(() => {
    void ArcGISTiledElevationTerrainProvider.fromUrl(ARCGIS_TERRAIN_URL).then(setProvider);
  }, []);
  return provider;
};

export const Cesium3DTilesetLayer: StoryFn = (args: Record<string, unknown>) => (
  <div style={mapDivStyle}>
    <CesiumMap {...args} layerManagerMetaMapping={layerManagerMetaMapping}>
      <Cesium3DTileset
        url={getValue('GLOBAL', '3D_MODEL')}
        meta={{ id: '1111111', layerRecord: { productName: 'Jerusalem A' } }}
        isZoomTo={true}
        onAllTilesLoad={action('onAllTilesLoad')}
        onInitialTilesLoad={action('onInitialTilesLoad')}
        onTileFailed={action('onTileFailed')}
        onTileLoad={action('onTileLoad')}
        onTileUnload={action('onTileUnload')}
        onReady={(_tileset): void => {
          action('onReady');
        }}
        onClick={action('onClick')}
      />
    </CesiumMap>
  </div>
);

Cesium3DTilesetLayer.args = {
  baseMaps: BASE_MAPS,
  zoom: 3,
};
Cesium3DTilesetLayer.argTypes = {
  zoom: {
    control: {
      type: 'range',
      min: 0,
      max: 20,
    },
  },
};

Cesium3DTilesetLayer.storyName = '3D Layer';

export const Cesium3DTilesetWithHeightCorrectionLayer: StoryFn = (args: Record<string, unknown>) => (
  <div style={mapDivStyle}>
    <CesiumMap {...args} layerManagerMetaMapping={layerManagerMetaMapping}>
      <Cesium3DTileset
        url={getValue('GLOBAL', '3D_MODEL')}
        meta={{ id: '2222222', layerRecord: { productName: 'Jerusalem B' } }}
        isZoomTo={false}
        heightFromGround={-10}
        onAllTilesLoad={action('onAllTilesLoad')}
        onInitialTilesLoad={action('onInitialTilesLoad')}
        onTileFailed={action('onTileFailed')}
        onTileLoad={action('onTileLoad')}
        onTileUnload={action('onTileUnload')}
        onReady={(_tileset): void => {
          action('onReady');
        }}
        onClick={action('onClick')}
      />
    </CesiumMap>
  </div>
);

Cesium3DTilesetWithHeightCorrectionLayer.args = {
  baseMaps: BASE_MAPS,
  zoom: 17,
  center: [-75.61208, 40.04227],
};
Cesium3DTilesetWithHeightCorrectionLayer.argTypes = {
  zoom: {
    control: {
      type: 'range',
      min: 0,
      max: 20,
    },
  },
};

Cesium3DTilesetWithHeightCorrectionLayer.storyName = '3D with Height Correction Layer';

export const CesiumSolar3DTilesetLayer: StoryFn = (args: Record<string, unknown>) => {
  const terrainProvider = useArcGisTerrainProvider();
  return (
    <div style={mapDivStyle}>
      <CesiumMap
        {...args}
        layerManagerMetaMapping={layerManagerMetaMapping}
        terrainProvider={terrainProvider}
      >
        <Cesium3DTileset
          url={getValue('GLOBAL', '3D_MODEL')}
          meta={{ id: '3333333', layerRecord: { productName: 'Jerusalem C' } }}
          isZoomTo={true}
        />
      </CesiumMap>
    </div>
  );
};

CesiumSolar3DTilesetLayer.args = {
  baseMaps: BASE_MAPS,
  center: [34.811, 31.908],
  zoom: 14,
};
CesiumSolar3DTilesetLayer.argTypes = {
  zoom: {
    control: {
      type: 'range',
      min: 0,
      max: 20,
    },
  },
};

CesiumSolar3DTilesetLayer.storyName = 'Solar 3D Layer with Terrain Provider';

const LABELS_OVERLAY_URL = getValue('GLOBAL', 'BM-TRANSPARENT_LABELS_OVERLAY-XYZ_LAYER');
const labelsOverlayProvider = new UrlTemplateImageryProvider({ url: LABELS_OVERLAY_URL });
const drapedLayerMeta = {
  id: 'TRANSPARENT_LABELS_OVERLAY',
  layerRecord: { productName: 'Transparent Labels Overlay' },
  options: { url: LABELS_OVERLAY_URL },
  searchLayerPredicate: (layer: ImageryLayer): boolean => layer.imageryProvider === labelsOverlayProvider,
};

export const Cesium3DTilesetWithDrapingLayer: StoryFn = (args: Record<string, unknown>) => (
  <div style={mapDivStyle}>
    <CesiumMap
      {...args}
      layerManagerMetaMapping={layerManagerMetaMapping}
      drapingLayerPredicate={(layerMeta: ICesiumImageryLayerMeta): boolean =>
        layerMeta.id === 'TRANSPARENT_LABELS_OVERLAY'
      }
    >
      <Cesium3DTileset
        url={getValue('GLOBAL', '3D_MODEL')}
        meta={{ id: '4444444', layerRecord: { productName: 'Jerusalem with Draping' } }}
        isZoomTo={true}
      />
      <CesiumImageryLayer
        imageryProvider={labelsOverlayProvider}
        alpha={0.7}
        meta={drapedLayerMeta}
      />
    </CesiumMap>
  </div>
);

Cesium3DTilesetWithDrapingLayer.args = {
  baseMaps: BASE_MAPS,
  zoom: 3,
};
Cesium3DTilesetWithDrapingLayer.argTypes = {
  zoom: {
    control: {
      type: 'range',
      min: 0,
      max: 20,
    },
  },
};
Cesium3DTilesetWithDrapingLayer.storyName = '3D Layer with Draping';
