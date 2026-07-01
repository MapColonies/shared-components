import {
  ArcGISTiledElevationTerrainProvider,
  EllipsoidTerrainProvider,
  TerrainProvider,
  VRTheWorldTerrainProvider,
  WebMercatorProjection,
  CesiumTerrainProvider,
  Resource,
  WebMercatorTilingScheme,
} from 'cesium';
import React, { ChangeEvent, useState } from 'react';
import type { StoryFn, Meta } from '@storybook/react';
import { getValue } from '../../utils/config';
import { BASE_MAPS } from '../helpers/constants';
import { Cesium3DTileset } from '../layers';
import { CesiumMap, useCesiumMap } from '../map';
import QuantizedMeshTerrainProvider from './custom/quantized-mesh-terrain-provider';

export default {
  title: 'Cesium Map/QuantizedMesh',
  component: CesiumMap,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta;

const mapDivStyle = {
  height: '90%',
  width: '100%',
  position: 'absolute' as const,
};

const layerManagerMetaMapping = {
  layer: {
    id: 'id',
    name: 'layerRecord.productName',
  },
};

const EllipsoidProvider = new EllipsoidTerrainProvider({});

const withFallbackProvider = (providerPromise: Promise<TerrainProvider>, providerName: string): Promise<TerrainProvider> => {
  return providerPromise.catch((error) => {
    console.warn(`[TerrainProvider] Failed to initialize ${providerName}. Falling back to Ellipsoid terrain.`, error);
    return EllipsoidProvider;
  });
};

const CesiumProvider = withFallbackProvider(
  CesiumTerrainProvider.fromUrl(
    new Resource({
      url: 'https://my-assets.cesium.com/1',
      headers: {
        authorization: 'Bearer <my-access-token>',
      },
    })
  ),
  'Cesium Terrain Provider'
);

const VRTheWorldProvider = withFallbackProvider(
  VRTheWorldTerrainProvider.fromUrl('https://www.vr-theworld.com/vr-theworld/tiles1.0.0/73/'),
  'VR The World Terrain Provider'
);

const ArcGisProvider = withFallbackProvider(
  ArcGISTiledElevationTerrainProvider.fromUrl('https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer'),
  'ArcGIS Terrain Provider'
);

const QuantizedMeshProvider = new QuantizedMeshTerrainProvider({
  getUrl: (x: number, y: number, level: number): string => {
    const tilingScheme = new WebMercatorTilingScheme();
    const column = x;
    const row = tilingScheme.getNumberOfYTilesAtLevel(level) - y - 1;

    return `/mock/terrain_example_tiles/${level}/${column}/${row}.terrain`;
  },
  credit: `Mapcolonies`,
});

const terrainProviderList = [
  {
    id: 'NONE',
    value: EllipsoidProvider,
  },
  {
    id: 'Cesium Terrain Provider',
    value: CesiumProvider,
  },
  {
    id: 'V R The World Terrain Provider (Hight Map)',
    value: VRTheWorldProvider,
  },
  {
    id: 'Arc Gis Terrain Provider',
    value: ArcGisProvider,
  },
  {
    id: 'Custom Terrain Provider',
    value: QuantizedMeshProvider,
  },
];

interface ITerrainProviderItem {
  id: string;
  value: TerrainProvider | QuantizedMeshTerrainProvider | Promise<TerrainProvider> | undefined;
}

interface ITerrainProviderSelectorProps {
  terrainProviderList: ITerrainProviderItem[];
}

const TerrainProviderSelector: React.FC<ITerrainProviderSelectorProps> = ({ terrainProviderList }) => {
  const [depthTest, setDepthTest] = useState<boolean>(false);
  const mapViewer = useCesiumMap();

  const scene = mapViewer.scene;

  const handleDepthTestChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setDepthTest(e.target.checked);
    scene.globe.depthTestAgainstTerrain = !depthTest;
  };

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.4rem' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
        <input type="checkbox" id="input" checked={depthTest} onChange={handleDepthTestChange} style={{ margin: 0 }} />
        <label htmlFor="input" style={{ lineHeight: 1 }}>
          depthTestAgainstTerrain
        </label>
      </div>
      <select
        defaultValue={terrainProviderList[0].id}
        onChange={(evt): void => {
          const selected = terrainProviderList.find((item) => item.id === evt.target.value);
          const provider = selected?.value;
          if (!provider) {
            return;
          }
          if (provider instanceof Promise) {
            void provider.then((resolvedProvider) => {
              mapViewer.terrainProvider = resolvedProvider;
            });
            return;
          }
          mapViewer.terrainProvider = provider as unknown as TerrainProvider;
        }}
      >
        {terrainProviderList.map((provider) => {
          return <option key={provider.id}>{provider.id}</option>;
        })}
      </select>
    </div>
  );
};

export const QuantizedMeshProviders: StoryFn = () => {
  // const [center] = useState<[number, number]>([24, -200]);
  const [center] = useState<[number, number]>([-122, 43]);
  return (
    <div style={mapDivStyle}>
      <CesiumMap
        center={center}
        zoom={5}
        baseMaps={BASE_MAPS}
        mapProjection={new WebMercatorProjection()}
        showDebuggerTool={true}
        layerManagerMetaMapping={layerManagerMetaMapping}
      >
        <Cesium3DTileset url={getValue('GLOBAL', '3D_MODEL')} meta={{ id: '1111111', layerRecord: { productName: 'Jerusalem' } }} isZoomTo={true} />
        <TerrainProviderSelector terrainProviderList={terrainProviderList} />
      </CesiumMap>
    </div>
  );
};

QuantizedMeshProviders.storyName = 'Providers';
