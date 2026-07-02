import {
  ArcGISTiledElevationTerrainProvider,
  EllipsoidTerrainProvider,
  // CesiumTerrainProvider,
  // Resource,
  TerrainProvider,
} from 'cesium';
import React, { useState } from 'react';
import type { StoryFn, Meta } from '@storybook/react';
import { getValue } from '../../utils/config';
import { BASE_MAPS } from '../helpers/constants';
import { Cesium3DTileset } from '../layers';
import { CesiumMap, CesiumViewer, useCesiumMap } from '../map';
import { TerrainianHeightTool } from '../tools/terranian-height.tool';

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

const terrainControlsStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'flex-start',
};

const layerManagerMetaMapping = {
  layer: {
    id: 'id',
    name: 'layerRecord.productName',
  },
};

const EllipsoidProvider = new EllipsoidTerrainProvider({});

const ArcGisProvider = ArcGISTiledElevationTerrainProvider.fromUrl(
  'https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer'
);

const terrainProviderListQmesh = [
  {
    id: 'NONE',
    value: EllipsoidProvider,
  },
  {
    id: 'Arc Gis Terrain Provider',
    value: ArcGisProvider,
  },
];

interface ITerrainProviderItem {
  id: string;
  value: TerrainProvider | Promise<TerrainProvider> | undefined;
}

interface ITerrainProviderSelectorProps {
  terrainProviderList: ITerrainProviderItem[];
}

const TerrainProviderSelector: React.FC<ITerrainProviderSelectorProps> = ({ terrainProviderList }) => {
  const mapViewer: CesiumViewer = useCesiumMap();

  return (
    <div>
      <select
        style={{
          display: 'block',
          marginTop: '8px',
          height: '32px',
          maxHeight: '32px',
          width: 'auto',
        }}
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
          mapViewer.terrainProvider = provider;
        }}
      >
        {terrainProviderList.map((provider) => {
          return <option key={provider.id}>{provider.id}</option>;
        })}
      </select>
    </div>
  );
};

export const QuantizedMeshHeightsTool: StoryFn = () => {
  const [center] = useState<[number, number]>([34.817, 31.911]);
  return (
    <div style={mapDivStyle}>
      <CesiumMap center={center} zoom={5} baseMaps={BASE_MAPS} showDebuggerTool={true} layerManagerMetaMapping={layerManagerMetaMapping}>
        <Cesium3DTileset url={getValue('GLOBAL', '3D_MODEL')} meta={{ id: '1111111', layerRecord: { productName: 'Jerusalem' } }} isZoomTo={true} />
        <div style={terrainControlsStyle}>
          <TerrainianHeightTool />
          <TerrainProviderSelector terrainProviderList={terrainProviderListQmesh} />
        </div>
      </CesiumMap>
    </div>
  );
};
QuantizedMeshHeightsTool.storyName = 'Heights Tool';
