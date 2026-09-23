import { useEffect, useState, FC } from 'react';
import type { StoryFn, Meta } from '@storybook/react';
import { action } from 'storybook/actions';
import type { CopcColorMode, CopcPointInspection } from '@frillab/copc-adapter/cesium';
import { BASE_MAPS, COPC_SAMPLE_URL_L0026 } from '../helpers/constants';
import { CesiumMap, useCesiumMap } from '../map';
import { CesiumCopcPointCloud } from './3d.point-cloud.copc';
import { CesiumColor } from '../proxied.types';

export default {
  title: 'Cesium Map/Layers/COPC Point Cloud',
  component: CesiumCopcPointCloud,
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

// Publicly hosted COPC sample dataset, commonly used across COPC tooling demos.
// const COPC_SAMPLE_URL = COPC_SAMPLE_URL_AUTZEN; //cls
// const COPC_SAMPLE_URL = 'https://s3.amazonaws.com/hobu-lidar/sofi.copc.laz';
const COPC_SAMPLE_URL = COPC_SAMPLE_URL_L0026;

// Local helper, not a story: Storybook only turns named exports into stories, so this stays out of the sidebar.
const BacgroundChanger: FC = () => {
  const mapViewer = useCesiumMap();

  useEffect(() => {
    if (mapViewer.scene) {
      mapViewer.scene.globe.baseColor = CesiumColor.WHITESMOKE;
    }
  }, [mapViewer.scene]);

  return <></>;
};

export const CopcPointCloudLayer: StoryFn = (args: Record<string, unknown>) => (
  <div style={mapDivStyle}>
    <CesiumMap {...args} layerManagerMetaMapping={layerManagerMetaMapping}>
      <BacgroundChanger />
      <CesiumCopcPointCloud
        url={COPC_SAMPLE_URL}
        colorMode="elevation"
        onReady={(): void => action('onReady')('layer ready')}
        onError={action('onError')}
      />
    </CesiumMap>
  </div>
);

CopcPointCloudLayer.args = {
  // baseMaps: BASE_MAPS,
  zoom: 3,
};
CopcPointCloudLayer.storyName = 'COPC Point Cloud Layer';

export const CopcPointCloudColorModes: StoryFn = (args: Record<string, unknown>) => {
  const colorMode = (args.colorMode as CopcColorMode | undefined) ?? 'elevation';
  const pointSize = (args.pointSize as number | undefined) ?? 3;

  return (
    <div style={mapDivStyle}>
      <CesiumMap {...args} layerManagerMetaMapping={layerManagerMetaMapping}>
        <BacgroundChanger />
        {/* Remount on colorMode/pointSize change so the underlying layer is recreated with the new options */}
        <CesiumCopcPointCloud key={`${colorMode}-${pointSize}`} url={COPC_SAMPLE_URL} colorMode={colorMode} pointSize={pointSize} />
      </CesiumMap>
    </div>
  );
};

CopcPointCloudColorModes.args = {
  // baseMaps: BASE_MAPS,
  zoom: 3,
  colorMode: 'elevation',
  pointSize: 3,
};
CopcPointCloudColorModes.argTypes = {
  colorMode: {
    control: { type: 'select' },
    options: ['fixed', 'elevation', 'rgb', 'intensity', 'classification'],
  },
  pointSize: {
    control: { type: 'range', min: 1, max: 10 },
  },
};
CopcPointCloudColorModes.storyName = 'Color Modes';

export const CopcPointCloudWithPicking: StoryFn = (args: Record<string, unknown>) => {
  const [pickedPoint, setPickedPoint] = useState<CopcPointInspection | undefined>(undefined);
  const hoverPixelSize = args.hoverPixelSize as number | undefined;
  return (
    <div style={mapDivStyle}>
      <CesiumMap {...args} layerManagerMetaMapping={layerManagerMetaMapping}>
        <BacgroundChanger />
        <CesiumCopcPointCloud url={COPC_SAMPLE_URL} colorMode="classification" onPointPicked={setPickedPoint} hoverPixelSize={hoverPixelSize} />
      </CesiumMap>
      <div
        style={{
          position: 'absolute',
          zIndex: 2,
          top: 10,
          left: 10,
          padding: '8px 12px',
          background: 'rgba(0, 0, 0, 0.7)',
          color: '#fff',
          fontFamily: 'monospace',
          fontSize: 12,
          borderRadius: 4,
          pointerEvents: 'none',
        }}
      >
        {pickedPoint === undefined ? (
          <>
            <div>Move the mouse over a point to enlarge it</div>
            <div>Click a point to inspect it</div>
          </>
        ) : (
          <>
            <div>lon: {pickedPoint.longitude.toFixed(6)}</div>
            <div>lat: {pickedPoint.latitude.toFixed(6)}</div>
            <div>height: {pickedPoint.height.toFixed(2)}m</div>
            {pickedPoint.classificationLabel !== undefined && <div>class: {pickedPoint.classificationLabel}</div>}
            {pickedPoint.intensity !== undefined && <div>intensity: {pickedPoint.intensity}</div>}
          </>
        )}
      </div>
    </div>
  );
};

CopcPointCloudWithPicking.args = {
  baseMaps: BASE_MAPS,
  zoom: 3,
};
CopcPointCloudWithPicking.argTypes = {
  hoverPixelSize: {
    control: { type: 'range', min: 3, max: 30 },
  },
};
CopcPointCloudWithPicking.storyName = 'Interactive Point Picking';
