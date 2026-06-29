import { ImageryLayer } from 'cesium';
import { Story, Meta } from '@storybook/react/types-6-0';
import { ArcGisMapServerImageryProvider, IonImageryProvider } from 'cesium';
import { BASE_MAPS } from '../helpers/constants';
import { getImageryProvider } from '../layers-manager';
import { CesiumMap } from '../map';
import { CesiumImageryLayer } from './imagery.layer';

export default {
  title: 'Cesium Map/Layers/ImageryLayer',
  component: CesiumImageryLayer,
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

const arcGisLayerMeta = {
  id: 'arcgis-layer',
  layerRecord: {
    productName: 'ArcGIS Street Map Layer',
  },
  searchLayerPredicate: (layer: ImageryLayer): boolean => getImageryProvider(layer) instanceof ArcGisMapServerImageryProvider,
};

const ionLayerMeta = {
  id: 'ion-layer',
  layerRecord: {
    productName: 'Cesium Ion Layer',
  },
  searchLayerPredicate: (layer: ImageryLayer): boolean => getImageryProvider(layer) instanceof IonImageryProvider,
};

export const MapWithImageryLayers: Story = () => (
  <div style={mapDivStyle}>
    <CesiumMap
      imageryProvider={false}
      baseMaps={BASE_MAPS}
      layerManagerMetaMapping={layerManagerMetaMapping}
    >
      <CesiumImageryLayer
        alpha={0.7}
        meta={arcGisLayerMeta}
        imageryProvider={
          new ArcGisMapServerImageryProvider({
            url: '//services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer',
          })
        }
      />
      <CesiumImageryLayer
        alpha={0.5}
        meta={ionLayerMeta}
        imageryProvider={new IonImageryProvider({ assetId: 3812 })}
      />
    </CesiumMap>
  </div>
);
MapWithImageryLayers.storyName = 'With 2 imagery layers';
