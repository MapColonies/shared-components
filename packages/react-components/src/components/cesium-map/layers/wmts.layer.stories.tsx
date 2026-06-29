import { Story, Meta } from '@storybook/react/types-6-0';
import { Credit } from 'cesium';
import { ImageryLayer } from 'cesium';
import { BASE_MAPS } from '../helpers/constants';
import { getImageryProviderUrl } from '../layers-manager';
import { CesiumMap } from '../map';
import { CesiumWMTSLayer } from './wmts.layer';

export default {
  title: 'Cesium Map/Layers/WMTSLayer',
  component: CesiumWMTSLayer,
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

const optionsWMTS = {
  url: 'http://basemap.nationalmap.gov/arcgis/rest/services/USGSShadedReliefOnly/MapServer/WMTS',
  layer: 'USGSShadedReliefOnly',
  style: 'default',
  format: 'image/jpeg',
  tileMatrixSetID: 'default028mm',
  // tileMatrixLabels : ['default028mm:0', 'default028mm:1', 'default028mm:2' ...],
  maximumLevel: 19,
  credit: new Credit('U. S. Geological Survey'),
};

const optionsWMTS2 = {
  url: 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSShadedReliefOnly/MapServer/WMTS',
  layer: 'USGSShadedReliefOnly',
  style: 'default',
  format: 'image/jpeg',
  tileMatrixSetID: 'default028mm',
  // tileMatrixLabels : ['default028mm:0', 'default028mm:1', 'default028mm:2' ...],
  maximumLevel: 19,
  credit: new Credit('U. S. Geological Survey'),
};

const wmtsLayerMeta = {
  id: 'wmts-layer',
  layerRecord: {
    productName: 'WMTS Layer',
  },
  options: { ...optionsWMTS },
  searchLayerPredicate: (layer: ImageryLayer): boolean => getImageryProviderUrl(layer) === optionsWMTS.url,
};

const wmtsLayerMeta2 = {
  id: 'wmts-layer-2',
  layerRecord: {
    productName: 'WMTS Layer 2',
  },
  options: { ...optionsWMTS2 },
  searchLayerPredicate: (layer: ImageryLayer): boolean => getImageryProviderUrl(layer) === optionsWMTS2.url,
};

export const MapWithWMTSLayers: Story = () => (
  <div style={mapDivStyle}>
    <CesiumMap
      imageryProvider={false}
      baseMaps={BASE_MAPS}
      layerManagerMetaMapping={layerManagerMetaMapping}
    >
      <CesiumWMTSLayer options={optionsWMTS} meta={wmtsLayerMeta} />
      <CesiumWMTSLayer options={optionsWMTS2} alpha={0.5} meta={wmtsLayerMeta2} />
    </CesiumMap>
  </div>
);
MapWithWMTSLayers.storyName = 'WMTS 2 layers';
