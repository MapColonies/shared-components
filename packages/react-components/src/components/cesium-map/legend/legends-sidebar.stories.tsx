import { useState } from 'react';
import { ImageryLayer } from 'cesium';
import { Story, Meta } from '@storybook/react/types-6-0';
import { BASE_MAPS } from '../helpers/constants';
import { getImageryProviderUrl } from '../layers-manager';
import { CesiumXYZLayer } from '../layers/xyz.layer';
import { CesiumMap } from '../map';

export default {
  title: 'Cesium Map',
  component: CesiumMap,
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

const optionsXYZSanDiego = {
  url: 'https://tiles.openaerialmap.org/5d73614588556200055f10d6/0/5d73614588556200055f10d7/{z}/{x}/{y}',
};

const layerMetaSanDiego = {
  id: 'layer-san-diego',
  layerRecord: {
    productName: 'San Diego Layer',
  },
  options: { ...optionsXYZSanDiego },
  searchLayerPredicate: (layer: ImageryLayer): boolean => getImageryProviderUrl(layer) === optionsXYZSanDiego.url,
};

export const MapWithLegends: Story = () => {
  const [center] = useState<[number, number]>([-117.30644008676421, 33.117098433617564]); //Sandiego Poinsettia Park
  return (
    <div style={mapDivStyle}>
      <CesiumMap
        center={center}
        zoom={14}
        baseMaps={BASE_MAPS}
        legends={{
          legendsList: [
            {
              layer: 'bluemarble',
              legendImg: 'https://c8.alamy.com/comp/F5HF5D/map-icon-legend-symbol-sign-toolkit-element-F5HF5D.jpg',
              legendDoc: 'http://www.africau.edu/images/default/sample.pdf',
            },
            {
              layer: 'bluemarble2',
              legendImg: 'https://i.pinimg.com/564x/55/cf/a1/55cfa147dfef99d231ec95ab8cd3652d--outdoor-code-cub-scouts-brownie-hiking-badge.jpg',
              legendDoc: 'http://www.africau.edu/images/default/sample.pdf',
            },
          ],
          title: 'Map Legends',
          emptyText: 'No legends for this basemap',
        }}
        layerManagerMetaMapping={layerManagerMetaMapping}
      >
        <CesiumXYZLayer options={optionsXYZSanDiego} meta={layerMetaSanDiego} />
      </CesiumMap>
    </div>
  );
};
MapWithLegends.storyName = 'Map with legends sidebar';
