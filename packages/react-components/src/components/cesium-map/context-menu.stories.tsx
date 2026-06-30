import React, { useEffect, useState } from 'react';
import { get } from 'lodash';
import { Button, Menu, MenuItem, MenuSurfaceAnchor } from '@map-colonies/react-core';
import { Story, Meta } from '@storybook/react';
import { Box } from '../box';
import { BASE_MAPS } from './helpers/constants';
import { getLayerId, ICesiumImageryLayer, IRasterLayer } from './layers-manager';
import { CesiumMap, IBaseMaps, IContextMenuData, useCesiumMap } from './map';
import { CesiumCartesian2, CesiumSceneMode } from './proxied.types';

export default {
  title: 'Cesium Map',
  component: CesiumMap,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta;

interface ILayersMozaikProps {
  layers: IRasterLayer[];
}

const getDebugLayerText = (layer: unknown): string => {
  const imageryLayer = layer as ICesiumImageryLayer;
  const layerId = getLayerId(imageryLayer) ?? 'UNKNOWN_LAYER_ID';
  const zIndex = get(layer, 'meta.zIndex') ?? 'NA';
  return `${layerId} <--> ${String(zIndex)}`;
};

const mapDivStyle = {
  height: '90%',
  width: '100%',
  position: 'absolute' as const,
};

const layerManagerMetaMapping = {
  layer: {
    id: 'id',
    name: 'layerRecord.productName',
    footprint: 'layerRecord.footprint',
  },
};

const layers: IRasterLayer[] = [
  {
    id: 'near_amphy',
    type: 'XYZ_LAYER',
    zIndex: 0,
    opacity: 1,
    show: true,
    options: {
      url: 'https://tiles.openaerialmap.org/5a9f90c42553e6000ce5ad6c/0/eee1a570-128e-4947-9ffa-1e69c1efab7c/{z}/{x}/{y}.png',
    },
    layerRecord: {
      footprint: {
        type: 'Polygon',
        coordinates: [
          [
            [34.8099445223518, 31.9061345394902],
            [34.8200994167574, 31.9061345394902],
            [34.8200994167574, 31.9106311613979],
            [34.8099445223518, 31.9106311613979],
            [34.8099445223518, 31.9061345394902],
          ],
        ],
      },
    },
  },
  {
    id: 'coin_zoom_17',
    type: 'XYZ_LAYER',
    zIndex: 1,
    opacity: 1,
    show: true,
    options: {
      url: 'https://tiles.openaerialmap.org/5a8316e22553e6000ce5ac7f/0/c3fcbe99-d339-41b6-8ec0-33d90ccca020/{z}/{x}/{y}.png',
    },
    layerRecord: {
      footprint: {
        type: 'Polygon',
        coordinates: [
          [
            [34.8106008249547, 31.9076273723004],
            [34.8137969069015, 31.9076273723004],
            [34.8137969069015, 31.9103791381117],
            [34.8106008249547, 31.9103791381117],
            [34.8106008249547, 31.9076273723004],
          ],
        ],
      },
    },
  },
  {
    id: 'biggest',
    type: 'XYZ_LAYER',
    zIndex: 2,
    opacity: 1,
    show: true,
    options: {
      url: 'https://tiles.openaerialmap.org/5a831b4a2553e6000ce5ac80/0/d02ddc76-9c2e-4994-97d4-a623eb371456/{z}/{x}/{y}.png',
    },
    layerRecord: {
      footprint: {
        type: 'Polygon',
        coordinates: [
          [
            [34.8043847068541, 31.9023297972932],
            [34.8142791322292, 31.9023297972932],
            [34.8142791322292, 31.9108796531516],
            [34.8043847068541, 31.9108796531516],
            [34.8043847068541, 31.9023297972932],
          ],
        ],
      },
    },
  },
];

const ContextMenu: React.FC<IContextMenuData> = ({ data, position, style, handleClose }) => {
  const mapViewer = useCesiumMap();
  const [pickedLayers, setPickedLayers] = useState<ICesiumImageryLayer[] | undefined>();

  const emptyStyle = {
    left: `${position.x}px`,
    top: `${position.y}px`,
  };

  useEffect(() => {
    setPickedLayers(mapViewer.layersManager?.pickImageryLayers(position as CesiumCartesian2));
    console.log(mapViewer.layersManager?.pickImageryLayers(position as CesiumCartesian2));
  }, [position]);

  return (
    <>
      {data.length > 0 && (
        <Box
          style={{
            ...emptyStyle,
            ...style,
            background: 'grey',
            position: 'absolute',
            borderRadius: '4px',
            padding: '12px',
            paddingBottom: '220px',
          }}
        >
          {data.length > 0 && (
            <>
              <h3>
                From POI <span style={{ color: 'red' }}>{data.length}</span> layers overlapping
              </h3>
              <div style={{ paddingLeft: '30px' }}>
                {data?.map((layer, index) => {
                  return <p key={`poi-layer-${index}`}>{getDebugLayerText(layer)}</p>;
                })}
              </div>
            </>
          )}
          <h3>
            From PICK API <span style={{ color: 'red' }}>{pickedLayers?.length}</span> layers at point
          </h3>
          <div style={{ paddingLeft: '30px' }}>
            {pickedLayers?.map((layer, index) => {
              return <p key={`picked-layer-${index}`}>{getDebugLayerText(layer)}</p>;
            })}
          </div>
          <MenuSurfaceAnchor>
            <Menu open={true} onClose={(): void => handleClose()} style={{ visibility: 'hidden', width: '100%' }}>
              <MenuItem>
                <Box></Box>
              </MenuItem>
            </Menu>
          </MenuSurfaceAnchor>
        </Box>
      )}
      {data.length === 0 && (
        <Box
          style={{
            ...emptyStyle,
            background: 'orange',
            position: 'absolute',
            borderRadius: '4px',
            padding: '12px',
          }}
        >
          <h3>No data found</h3>
          <MenuSurfaceAnchor>
            <Menu open={true} onClose={(): void => handleClose()} style={{ visibility: 'hidden', width: '100%' }}>
              <MenuItem>
                <Box></Box>
              </MenuItem>
            </Menu>
          </MenuSurfaceAnchor>
        </Box>
      )}
    </>
  );
};

const LayersMozaik: React.FC<ILayersMozaikProps> = (props) => {
  const mapViewer = useCesiumMap();
  const { layers } = props;
  const [selectedLayer, setSelectedLayer] = useState<string>('');
  const [times, setTimes] = useState<number>(1);
  const [allShow, setAllShow] = useState<boolean>(false);

  // IMPORTANT: For non CesiumSceneMode.SCENE2D CESIUM mapViewer.scene.pickPosition() not working well if NO TILT (probably CESIUM issue)
  mapViewer.scene.globe.depthTestAgainstTerrain = true;

  useEffect(() => {
    const sortedLayers = layers?.sort((layer1, layer2) => layer1.zIndex - layer2.zIndex);
    sortedLayers?.forEach((layer, idx) => {
      mapViewer.layersManager?.addRasterLayer(layer, idx, '');
    });
    setSelectedLayer(layers ? layers[0].id : '');
  }, [layers, mapViewer.layersManager]);

  const handleRaise = (): void => {
    mapViewer.layersManager?.raise(selectedLayer, times);
  };

  const handleLower = (): void => {
    mapViewer.layersManager?.lower(selectedLayer, times);
  };

  const handleRaiseToTop = (): void => {
    mapViewer.layersManager?.raiseToTop(selectedLayer);
  };

  const handleLowerToBottom = (): void => {
    mapViewer.layersManager?.lowerToBottom(selectedLayer);
  };

  const handleToglleAll = (): void => {
    mapViewer.layersManager?.showAllNotBase(!allShow);
    setAllShow(!allShow);
  };

  const controlsContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap' as const,
    alignItems: 'center',
    gap: '8px',
    padding: '10px 12px',
    borderRadius: '10px',
    background: 'rgba(0, 0, 0, 0.75)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: 'white',
    position: 'absolute' as const,
    top: '10px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 2,
    maxWidth: 'calc(100% - 20px)',
  };

  const messageStyle = {
    margin: 0,
    color: '#8dff9f',
    fontSize: '18px',
    fontWeight: 700,
    flexBasis: '100%',
  };

  const fieldStyle = {
    height: '30px',
    borderRadius: '6px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    background: 'rgba(255, 255, 255, 0.08)',
    color: 'white',
    padding: '0 8px',
  };

  const buttonStyle = {
    height: '30px',
    borderRadius: '6px',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    background: 'rgba(96, 165, 250, 0.25)',
    color: 'white',
    padding: '0 10px',
    cursor: 'pointer',
    fontWeight: 600,
  };

  return (
    <div style={controlsContainerStyle}>
      <h3 style={messageStyle}>Change BASE MAP to see effective layers</h3>
      <select
        style={fieldStyle}
        defaultValue={selectedLayer}
        onChange={(evt): void => {
          setSelectedLayer(evt.target.value);
        }}
      >
        {layers?.map((layer) => (
          <option key={layer.id} value={layer.id} style={{ background: '#3f3f3f', color: 'white' }}>
            {layer.id}
          </option>
        ))}
      </select>
      <input
        style={{ ...fieldStyle, width: '40px' }}
        type="number"
        value={times}
        onChange={(evt): void => {
          setTimes(parseInt(evt.target.value));
        }}
      ></input>
      <Button
        outlined
        style={buttonStyle}
        onClick={(): void => {
          handleRaise();
        }}
      >
        Raise
      </Button>
      <Button
        outlined
        style={buttonStyle}
        onClick={(): void => {
          handleLower();
        }}
      >
        Lower
      </Button>
      <Button
        outlined
        style={buttonStyle}
        onClick={(): void => {
          handleRaiseToTop();
        }}
      >
        Raise To Top
      </Button>
      <Button
        outlined
        style={buttonStyle}
        onClick={(): void => {
          handleLowerToBottom();
        }}
      >
        Lower To Bottom
      </Button>
      <Button
        outlined
        style={{ ...buttonStyle, background: 'rgba(74, 222, 128, 0.25)' }}
        onClick={(): void => {
          handleToglleAll();
        }}
      >
        Toggle All
      </Button>
    </div>
  );
};

export const MapWithLayersManagerAndContextMenu: Story = () => {
  const [center] = useState<[number, number]>([34.811, 31.908]);

  return (
    <div style={mapDivStyle}>
      <CesiumMap
        center={center}
        zoom={14}
        sceneMode={CesiumSceneMode.SCENE2D}
        baseMaps={BASE_MAPS}
        // @ts-ignore
        imageryContextMenu={<ContextMenu />}
        imageryContextMenuSize={{ height: 340, width: 200 }}
        showDebuggerTool={true}
        layerManagerMetaMapping={layerManagerMetaMapping}
      >
        <LayersMozaik layers={layers} />
      </CesiumMap>
    </div>
  );
};

MapWithLayersManagerAndContextMenu.storyName = 'Layers Manager and Context Menu';
