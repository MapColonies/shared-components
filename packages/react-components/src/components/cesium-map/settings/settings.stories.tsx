import { useState } from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';
import { BASE_MAPS } from '../helpers/constants';
import { CesiumXYZLayer } from '../layers/xyz.layer';
import { CesiumMap } from '../map';
import { CesiumSceneMode } from '../map.types';

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

const optionsXYZSanDiego = {
  url: 'https://tiles.openaerialmap.org/5d73614588556200055f10d6/0/5d73614588556200055f10d7/{z}/{x}/{y}',
};

export const MapWithSettings: Story = () => {
  const [center] = useState<[number, number]>([-117.30644008676421, 33.117098433617564]); //Sandiego Poinsettia Park
  return (
    <div style={mapDivStyle}>
      <CesiumMap
        center={center}
        zoom={14}
        imageryProvider={false}
        sceneModes={[CesiumSceneMode.SCENE3D, CesiumSceneMode.SCENE2D, CesiumSceneMode.COLUMBUS_VIEW]}
        baseMaps={BASE_MAPS}
      >
        <CesiumXYZLayer options={optionsXYZSanDiego} />
      </CesiumMap>
    </div>
  );
};
MapWithSettings.storyName = 'Map Settings';
