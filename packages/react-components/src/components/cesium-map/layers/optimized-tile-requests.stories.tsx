import React, { ReactNode, useEffect, useState } from 'react';
import { ImageryLayer, Rectangle } from 'cesium';
import { get } from 'lodash';
import { Story, Meta } from '@storybook/react';
import bbox from '@turf/bbox';
import { Tooltip } from '@map-colonies/react-core';
import { Box } from '../../box';
import { BASE_MAPS } from '../helpers/constants';
import { TRANSPARENT_LAYER_ID } from '../layers-manager';
import { CesiumMap, CesiumMapProps, IBaseMaps, useCesiumMap, useCesiumMapViewstate } from '../map';
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

const mapViewProps: CesiumMapProps = {
  center: [-117.30644008676421, 33.117098433617564],
  zoom: 14,
  imageryProvider: false,
  baseMaps: BASE_MAPS as IBaseMaps,
};

interface LayerMetaItem {
  layerId?: string;
  meta?: Record<string, unknown>;
}

const RelevancyPresentor: React.FC = () => {
  const viewer = useCesiumMap();
  const { viewState } = useCesiumMapViewstate();
  const [layersMeta, setLayersMeta] = useState<LayerMetaItem[]>([]);

  const updateLayerRelevancy = (): void => {
    if (viewer.layersManager?.layerList) {
      setLayersMeta(
        viewer.layersManager.layerList
          .filter((layer): boolean => layer.meta?.id !== TRANSPARENT_LAYER_ID)
          .map(
            (layer): LayerMetaItem => ({
              layerId: layer.meta?.id as string | undefined,
              meta: layer.meta as Record<string, unknown> | undefined,
            })
          )
      );
    }
  };

  useEffect(() => {
    const removeTileLoad = viewer.scene.globe.tileLoadProgressEvent.addEventListener((tilesLoadingCount) => {
      if (tilesLoadingCount === 0) {
        updateLayerRelevancy();
        removeTileLoad();
      }
    });

    const removeMoveEnd = viewer.camera.moveEnd.addEventListener(() => {
      updateLayerRelevancy();
    });

    const handleLayerUpdated = (): void => {
      updateLayerRelevancy();
    };

    viewer.layersManager?.addLayerUpdatedListener(handleLayerUpdated);

    return (): void => {
      removeTileLoad();
      removeMoveEnd();
      viewer.layersManager?.removeLayerUpdatedListener(handleLayerUpdated);
    };
  }, [viewer]);

  useEffect(() => {
    updateLayerRelevancy();
  }, [viewState?.shouldOptimizedTileRequests]);

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          zIndex: 999,
          background: 'white',
          padding: '20px',
          fontFamily: 'Helvetica',
          minWidth: '200px',
          minHeight: '200px',
        }}
      >
        <h3>{`Optimized Tile Requesting: ${viewState?.shouldOptimizedTileRequests ? 'enabled' : 'disabled'}`}</h3>
        {[...layersMeta].reverse().map((layer, index) => {
          const idText = layer.layerId ?? `LAYER-${layersMeta.length - index}`;
          const nameText = (get(layer.meta, 'layerRecord.productName') as string | undefined) ?? idText;
          const statusText = layer.meta?.relevantToExtent === true ? ' → show' : layer.meta?.relevantToExtent === false ? ' → hide' : '';
          const transparencyText = layer.meta?.hasTransparency === true ? 'Has transparent tiles' : layer.meta?.hasTransparency === false ? 'No transparent tiles' : '';
          if (transparencyText === '') {
            return (
              <Box key={idText} className="debuggerLayerItem">
                {nameText + statusText}
              </Box>
            );
          }
          return (
            <Tooltip key={idText} content={transparencyText}>
              <Box className="debuggerLayerItem">
                {nameText + statusText}
              </Box>
            </Tooltip>
          );
        })}
      </div>
    </>
  );
};

const LayersContainer: React.FC = () => {
  const [layer, setLayer] = useState<ReactNode>(null);
  const btnStyle = {
    position: 'absolute',
    top: 50,
    left: '50%',
    zIndex: 1000,
    transform: 'translate(0, -50%)',
  } as React.CSSProperties;

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

  return (
    <>
      <div className="buttonsContainer" style={{ display: 'flex', gap: '10px', ...btnStyle }}>
        <button
          onClick={(): void =>
            setLayer(
              <CesiumXYZLayer
                key="Transparent"
                meta={{
                  id: 'Transparent Layer',
                  options: { ...optionsXYZTransparency },
                  searchLayerPredicate: (layer: ImageryLayer): boolean =>
                    get(layer, 'imageryProvider.url') === optionsXYZTransparency.url ||
                    get(layer, 'imageryProvider._url') === optionsXYZTransparency.url,
                }}
                rectangle={Rectangle.fromDegrees(...bbox(optionsXYZTransparency.footprint))}
                options={optionsXYZTransparency}
              />
            )
          }
        >
          Transparent layer
        </button>
        <button
          onClick={(): void =>
            setLayer(
              <CesiumXYZLayer
                key="Opaque"
                meta={{
                  id: 'Opaque Layer',
                  options: { ...optionsXYZOpaque },
                  searchLayerPredicate: (layer: ImageryLayer): boolean =>
                    get(layer, 'imageryProvider.url') === optionsXYZOpaque.url ||
                    get(layer, 'imageryProvider._url') === optionsXYZOpaque.url,
                }}
                rectangle={Rectangle.fromDegrees(...bbox(optionsXYZOpaque.footprint))}
                options={optionsXYZOpaque}
              />
            )
          }
        >
          Opaque layer
        </button>
      </div>
      {layer}
    </>
  );
};

export const OptimizedTileRequestingMap: Story = () => {
  return (
    <div style={mapDivStyle}>
      <CesiumMap {...mapViewProps} showDebuggerTool={true}>
        <LayersContainer />
        <RelevancyPresentor />
      </CesiumMap>
    </div>
  );
};

OptimizedTileRequestingMap.storyName = 'Optimized Tile Requesting';
