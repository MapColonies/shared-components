import { useState } from 'react';
import { ImageryLayer } from 'cesium';
import type { StoryFn, Meta } from '@storybook/react';
import { BASE_MAPS } from '../helpers/constants';
import { getImageryProviderUrl } from '../layers-manager';
import { CesiumMap } from '../map';
import { CesiumSceneMode } from '../proxied.types';
import { CesiumOSMLayer } from './osm.layer';
import { CesiumXYZLayer } from './xyz.layer';

export default {
  title: 'Cesium Map/Layers/OSMLayer',
  component: CesiumOSMLayer,
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

const optionsOSM = {
  url: 'https://a.tile.openstreetmap.org/',
};
const optionsXYZ = {
  url: `https://tiles.openaerialmap.org/5b25fa612b6a08001185f80f/0/5b25fa612b6a08001185f810/{z}/{x}/{y}.png`,
};

const osmLayerMeta = {
  id: 'osm-layer',
  layerRecord: {
    productName: 'OSM Layer',
  },
  options: { ...optionsOSM },
  searchLayerPredicate: (layer: ImageryLayer): boolean => getImageryProviderUrl(layer) === optionsOSM.url,
};

const xyzLayerMeta = {
  id: 'xyz-layer',
  layerRecord: {
    productName: 'XYZ Layer',
  },
  options: { ...optionsXYZ },
  searchLayerPredicate: (layer: ImageryLayer): boolean => getImageryProviderUrl(layer) === optionsXYZ.url,
};

export const MapWithOSMLayers: StoryFn = () => {
  const [center] = useState<[number, number]>([34.82, 32.04]);
  return (
    <div style={mapDivStyle}>
      <CesiumMap center={center} baseMaps={BASE_MAPS} sceneMode={CesiumSceneMode.SCENE2D} zoom={14} layerManagerMetaMapping={layerManagerMetaMapping}>
        <CesiumOSMLayer options={optionsOSM} meta={osmLayerMeta} />
        <CesiumXYZLayer options={optionsXYZ} meta={xyzLayerMeta} />
      </CesiumMap>
    </div>
  );
};
MapWithOSMLayers.storyName = 'OSM layer and XYZ';
