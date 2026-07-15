import React, { useState } from 'react';
import { ImageryLayer, Rectangle } from 'cesium';
import type { StoryFn, Meta } from '@storybook/react';
import bbox from '@turf/bbox';
import { BASE_MAPS } from '../helpers/constants';
import { getImageryProviderUrl } from '../layers-manager';
import { CesiumMap, CesiumMapProps } from '../map';
import { CesiumXYZLayer } from './xyz.layer';

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

const mapViewProps: CesiumMapProps = {
  center: [-117.30644008676421, 33.117098433617564],
  zoom: 14,
  baseMaps: BASE_MAPS,
  layerManagerMetaMapping,
};

const optionsXYZTransparency = {
  url: 'https://tiles.openaerialmap.org/5d73614588556200055f10d6/0/5d73614588556200055f10d7/{z}/{x}/{y}',
  footprint: {
    coordinates: [
      [
        [-117.30976118375267, 33.116454006568205],
        [-117.30976118375267, 33.11330462707964],
        [-117.30513526140776, 33.11330462707964],
        [-117.30513526140776, 33.116454006568205],
        [-117.30976118375267, 33.116454006568205],
      ],
    ],
    type: 'Polygon',
  },
};

const optionsXYZOpaque = {
  url: 'https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}.png',
  footprint: {
    coordinates: [
      [
        [-117.31921599064628, 33.1210849388296],
        [-117.31921599064628, 33.1094152732627],
        [-117.29986251692546, 33.1094152732627],
        [-117.29986251692546, 33.1210849388296],
        [-117.31921599064628, 33.1210849388296],
      ],
    ],
    type: 'Polygon',
  },
};

const rectangleXYZTransparency = Rectangle.fromDegrees(...bbox(optionsXYZTransparency.footprint));
const rectangleXYZOpaque = Rectangle.fromDegrees(...bbox(optionsXYZOpaque.footprint));

const LayersContainer: React.FC = () => {
  const [showTransparent, setShowTransparent] = useState(false);
  const [showOpaque, setShowOpaque] = useState(false);
  const btnStyle = {
    position: 'absolute',
    top: 50,
    left: '50%',
    zIndex: 1000,
    transform: 'translate(0, -50%)',
  } as React.CSSProperties;

  return (
    <>
      <div className="buttonsContainer" style={{ display: 'flex', gap: '10px', ...btnStyle }}>
        <button
          style={{ fontWeight: showTransparent ? 'bold' : 'normal' }}
          onClick={(): void => setShowTransparent((prev) => !prev)}
        >
          Transparent layer
        </button>
        <button
          style={{ fontWeight: showOpaque ? 'bold' : 'normal' }}
          onClick={(): void => setShowOpaque((prev) => !prev)}
        >
          Opaque layer
        </button>
      </div>
      {showTransparent && (
        <CesiumXYZLayer
          key="Transparent"
          meta={{
            id: 'Transparent Layer',
            options: { ...optionsXYZTransparency },
            searchLayerPredicate: (layer: ImageryLayer): boolean => getImageryProviderUrl(layer) === optionsXYZTransparency.url,
          }}
          rectangle={rectangleXYZTransparency}
          options={optionsXYZTransparency}
        />
      )}
      {showOpaque && (
        <CesiumXYZLayer
          key="Opaque"
          meta={{
            id: 'Opaque Layer',
            options: { ...optionsXYZOpaque },
            searchLayerPredicate: (layer: ImageryLayer): boolean => getImageryProviderUrl(layer) === optionsXYZOpaque.url,
          }}
          rectangle={rectangleXYZOpaque}
          options={optionsXYZOpaque}
        />
      )}
    </>
  );
};

export const OptimizedTileRequestingMap: StoryFn = () => {
  return (
    <div style={mapDivStyle}>
      <CesiumMap {...mapViewProps} showDebuggerTool={true} layerManagerMetaMapping={layerManagerMetaMapping}>
        <LayersContainer />
      </CesiumMap>
    </div>
  );
};

OptimizedTileRequestingMap.storyName = 'Optimized Tile Requesting';
