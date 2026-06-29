import {
  ArcGISTiledElevationTerrainProvider,
  EllipsoidTerrainProvider,
  // CesiumTerrainProvider,
  // Resource,
  TerrainProvider,
} from 'cesium';
import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';
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

//#region TILER MATERIALS
// const TTCesiumProviderSrtm30 = new CesiumTerrainProvider({
//   url: new Resource({
//     url: 'http://localhost:8002/srtm30',
//   }),
// });
// const TTCesiumProviderSrtm100 = new CesiumTerrainProvider({
//   url: new Resource({
//     url: 'http://localhost:8002/srtm100',
//   }),
// });
// const TTCesiumProviderMergedDescending = new CesiumTerrainProvider({
//   url: new Resource({
//     url: 'http://localhost:8002/mergedDescending',
//   }),
// });
//#endregion

//#region CTBD MATERIALS
// const CTBDCesiumProviderSrtm30 = new CesiumTerrainProvider({
//   url: new Resource({
//     url: 'http://localhost:3000/srtm30',
//   }),
// });
// const CTBDCesiumProviderSrtm100 = new CesiumTerrainProvider({
//   url: new Resource({
//     url: 'http://localhost:3000/srtm100',
//   }),
// });
// const CTBDCesiumProviderMergedAscending = new CesiumTerrainProvider({
//   url: new Resource({
//     url: 'http://localhost:3000/mergedAscending',
//   }),
// });
//#endregion

const ArcGisProvider = new ArcGISTiledElevationTerrainProvider({
  url: 'https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer',
});

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
  value: TerrainProvider | undefined;
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
          mapViewer.terrainProvider = (selected as ITerrainProviderItem).value as TerrainProvider;
        }}
      >
        {terrainProviderList.map((provider) => {
          return <option key={provider.id}>{provider.id}</option>;
        })}
      </select>
    </div>
  );
};

export const QuantizedMeshHeightsTool: Story = () => {
  const [center] = useState<[number, number]>([34.817, 31.911]);
  return (
    <div style={mapDivStyle}>
      <CesiumMap
        center={center}
        zoom={5}
        imageryProvider={false}
        baseMaps={BASE_MAPS}
        showDebuggerTool={true}
        layerManagerMetaMapping={layerManagerMetaMapping}
      >
        <Cesium3DTileset
          url={getValue('GLOBAL', '3D_MODEL')}
          meta={{ id: '1111111', layerRecord: { productName: 'Jerusalem' } }}
          isZoomTo={true}
        />
        <div style={terrainControlsStyle}>
          <TerrainianHeightTool />
          <TerrainProviderSelector terrainProviderList={terrainProviderListQmesh} />
        </div>
      </CesiumMap>
    </div>
  );
};
QuantizedMeshHeightsTool.storyName = 'Heights Tool';
