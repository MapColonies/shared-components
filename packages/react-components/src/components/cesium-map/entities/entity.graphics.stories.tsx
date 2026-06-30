import { Cartesian3, Color } from 'cesium';
import { Story, Meta } from '@storybook/react/types-6-0';
import { BASE_MAPS } from '../helpers/constants';
import { CesiumMap } from '../map';
import { CesiumEntity } from './entity';
import { CesiumEntityStaticDescription } from './entity.description';
import { CesiumPolygonGraphics } from './graphics/polygon.graphics';

export default {
  title: 'Cesium Map/Entity/Graphics',
  component: CesiumEntity,
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

export const Polygon: Story = (args) => (
  <div style={mapDivStyle}>
    <CesiumMap
      baseMaps={BASE_MAPS}
      layerManagerMetaMapping={layerManagerMetaMapping}
    >
      <CesiumEntity {...args} name="test">
        <CesiumEntityStaticDescription>
          <h1>Hello!</h1>
          <p>This is description. It can be described with static JSX!</p>
        </CesiumEntityStaticDescription>
        <CesiumPolygonGraphics
          hierarchy={
            // eslint-disable-next-line
            Cartesian3.fromDegreesArray([-108.0, 42.0, -100.0, 42.0, -104.0, 40.0]) as any
          } // WORKAROUND
          material={Color.GREEN}
        />
      </CesiumEntity>
    </CesiumMap>
  </div>
);
