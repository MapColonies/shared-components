import { ArcGISTiledElevationTerrainProvider, TerrainProvider } from 'cesium';
import React, { useState, useEffect } from 'react';
import { Story, Meta } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { getValue } from '../../utils/config';
import { BASE_MAPS } from '../helpers/constants';
import { CesiumMap } from '../map';
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

export const Cesium3DTilesetLayer: Story = (args: Record<string, unknown>) => (
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
        onReady={(tileset): void => {
          action('onReady');
        }}
        onClick={action('onClick')}
      />
    </CesiumMap>
  </div>
);

Cesium3DTilesetLayer.argTypes = {
  baseMaps: {
    defaultValue: BASE_MAPS,
  },
  zoom: {
    defaultValue: 3,
    control: {
      type: 'range',
      min: 0,
      max: 20,
    },
  },
};

Cesium3DTilesetLayer.storyName = '3D Layer';

export const Cesium3DTilesetWithHeightCorrectionLayer: Story = (args: Record<string, unknown>) => (
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
        onReady={(tileset): void => {
          action('onReady');
        }}
        onClick={action('onClick')}
      />
    </CesiumMap>
  </div>
);

Cesium3DTilesetWithHeightCorrectionLayer.argTypes = {
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
  center: {
    defaultValue: [-75.61208, 40.04227],
  },
};

Cesium3DTilesetWithHeightCorrectionLayer.storyName = '3D with Height Correction Layer';

export const CesiumSolar3DTilesetLayer: Story = (args: Record<string, unknown>) => {
  const terrainProvider = useArcGisTerrainProvider();
  return (
    <div style={mapDivStyle}>
      <CesiumMap {...args} layerManagerMetaMapping={layerManagerMetaMapping} terrainProvider={terrainProvider}>
        <Cesium3DTileset url={getValue('GLOBAL', '3D_MODEL')} meta={{ id: '3333333', layerRecord: { productName: 'Jerusalem C' } }} isZoomTo={true} />
      </CesiumMap>
    </div>
  );
};

CesiumSolar3DTilesetLayer.argTypes = {
  baseMaps: {
    defaultValue: BASE_MAPS,
  },
  center: {
    defaultValue: [34.811, 31.908],
  },
  zoom: {
    defaultValue: 14,
    control: {
      type: 'range',
      min: 0,
      max: 20,
    },
  },
};

CesiumSolar3DTilesetLayer.storyName = 'Solar 3D Layer with Terrain Provider';
