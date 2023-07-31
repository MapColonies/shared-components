import React, { useEffect, useState } from 'react';
import { Story, Meta } from '@storybook/react';
import { Menu, MenuItem, MenuSurfaceAnchor } from '@map-colonies/react-core';
import { Box } from '../box';
import { CesiumMap, IContextMenuData, useCesiumMap } from './map';
import { CesiumSceneMode } from './map.types';
import { ICesiumImageryLayer, IRasterLayer } from './layers-manager';
import { IBaseMaps } from './settings/settings';
import { CesiumCartesian2 } from './proxied.types';

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

const mapDivStyle = {
  height: '90%',
  width: '100%',
  position: 'absolute' as const,
};

const BASE_MAPS = {
  maps: [
    {
      id: '1st',
      title: '1st Map Title',
      thumbnail: 'https://nsw.digitaltwin.terria.io/build/3456d1802ab2ef330ae2732387726771.png',
      baseRasteLayers: [
        {
          id: 'GOOGLE_TERRAIN',
          type: 'XYZ_LAYER',
          opacity: 1,
          zIndex: 0,
          options: {
            url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
            layers: '',
            credit: 'GOOGLE',
          },
        },
        {
          id: 'INFRARED_RASTER',
          type: 'WMS_LAYER',
          opacity: 0.6,
          zIndex: 1,
          options: {
            url: 'https://mesonet.agron.iastate.edu/cgi-bin/wms/goes/conus_ir.cgi?',
            layers: 'goes_conus_ir',
            credit: 'Infrared data courtesy Iowa Environmental Mesonet',
            parameters: {
              transparent: 'true',
              format: 'image/png',
            },
          },
        },
      ],
      baseVectorLayers: [],
    },
    {
      id: '2nd',
      title: '2nd Map Title',
      thumbnail: 'https://nsw.digitaltwin.terria.io/build/efa2f6c408eb790753a9b5fb2f3dc678.png',
      baseRasteLayers: [
        {
          id: 'RADAR_RASTER',
          type: 'WMS_LAYER',
          opacity: 0.6,
          zIndex: 1,
          options: {
            url: 'https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi?',
            layers: 'nexrad-n0r',
            credit: 'Radar data courtesy Iowa Environmental Mesonet',
            parameters: {
              transparent: 'true',
              format: 'image/png',
            },
          },
        },
        {
          id: 'GOOGLE_TERRAIN',
          type: 'XYZ_LAYER',
          opacity: 1,
          zIndex: 0,
          options: {
            url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
            layers: '',
            credit: 'GOOGLE',
          },
        },
        {
          id: 'VECTOR_TILES_GPS',
          type: 'XYZ_LAYER',
          opacity: 1,
          zIndex: 2,
          options: {
            url: 'https://gps.tile.openstreetmap.org/lines/{z}/{x}/{y}.png',
            layers: '',
            credit: 'openstreetmap',
          },
        },
      ],
      baseVectorLayers: [],
    },
    {
      id: '3rd',
      title: '3rd Map Title',
      isCurrent: true,
      thumbnail: 'https://nsw.digitaltwin.terria.io/build/d8b97d3e38a0d43e5a06dea9aae17a3e.png',
      baseRasteLayers: [
        {
          id: 'VECTOR_TILES',
          type: 'XYZ_LAYER',
          opacity: 1,
          zIndex: 0,
          options: {
            url: 'https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=6170aad10dfd42a38d4d8c709a536f38',
            layers: '',
            credit: 'thunderforest',
          },
        },
        {
          id: 'VECTOR_TILES_GPS',
          type: 'XYZ_LAYER',
          opacity: 1,
          zIndex: 1,
          options: {
            url: 'https://gps.tile.openstreetmap.org/lines/{z}/{x}/{y}.png',
            layers: '',
            credit: 'openstreetmap',
          },
        },
        {
          id: 'WMTS_POPULATION_TILES',
          type: 'WMTS_LAYER',
          opacity: 0.4,
          zIndex: 2,
          options: {
            url: 'https://services.arcgisonline.com/arcgis/rest/services/Demographics/USA_Population_Density/MapServer/WMTS/',
            layer: 'USGSShadedReliefOnly',
            style: 'default',
            format: 'image/jpeg',
            tileMatrixSetID: 'default028mm',
            maximumLevel: 19,
            credit: 'U. S. Geological Survey',
          },
        },
      ],
      baseVectorLayers: [],
    },
  ],
};

const layers = [
  {
    id: 'near_amphy',
    type: 'XYZ_LAYER',
    opacity: 1,
    show: true,
    meta: {
      zIndex: 0,
    },
    options: {
      url: 'https://tiles.openaerialmap.org/5a9f90c42553e6000ce5ad6c/0/eee1a570-128e-4947-9ffa-1e69c1efab7c/{z}/{x}/{y}.png',
    },
    details: {
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
    opacity: 1,
    show: true,
    meta: {
      zIndex: 1,
    },
    options: {
      url: 'https://tiles.openaerialmap.org/5a8316e22553e6000ce5ac7f/0/c3fcbe99-d339-41b6-8ec0-33d90ccca020/{z}/{x}/{y}.png',
    },
    details: {
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
    opacity: 1,
    show: true,
    meta: {
      zIndex: 2,
    },
    options: {
      url: 'https://tiles.openaerialmap.org/5a831b4a2553e6000ce5ac80/0/d02ddc76-9c2e-4994-97d4-a623eb371456/{z}/{x}/{y}.png',
    },
    details: {
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

const ContextMenu: React.FC<IContextMenuData> = ({ data, position, style, size, handleClose }) => {
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
                {data?.map((layer) => {
                  return (
                    <p>{`${(layer as unknown as Record<string, unknown>).meta?.id} <--> ${
                      (layer as unknown as Record<string, unknown>).meta?.meta?.zIndex
                    }`}</p>
                  );
                })}
              </div>
            </>
          )}
          <h3>
            From PICK API <span style={{ color: 'red' }}>{pickedLayers?.length}</span> layers at point
          </h3>
          <div style={{ paddingLeft: '30px' }}>
            {pickedLayers?.map((layer) => {
              return (
                <p>{`${(layer as unknown as Record<string, unknown>).meta?.id} <--> ${
                  (layer as unknown as Record<string, unknown>).meta?.meta?.zIndex
                }`}</p>
              );
            })}
          </div>
          <MenuSurfaceAnchor>
            <Menu open={true} onClose={(evt): void => handleClose()} style={{ visibility: 'hidden', width: '100%' }}>
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
            <Menu open={true} onClose={(evt): void => handleClose()} style={{ visibility: 'hidden', width: '100%' }}>
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

  return (
    <div style={{ height: '30px' }}>
      <h3 style={{ color: 'green' }}>Change BASE MAP to see effective layers</h3>
      <select
        defaultValue={selectedLayer}
        onChange={(evt): void => {
          setSelectedLayer(evt.target.value);
        }}
      >
        {layers?.map((layer) => (
          <option key={layer.id} defaultValue={layer.id}>
            {layer.id}
          </option>
        ))}
      </select>
      <input
        type="number"
        value={times}
        onChange={(evt): void => {
          setTimes(parseInt(evt.target.value));
        }}
      ></input>
      <button
        onClick={(): void => {
          handleRaise();
        }}
      >
        Raise
      </button>
      <button
        onClick={(): void => {
          handleLower();
        }}
      >
        Lower
      </button>
      <button
        onClick={(): void => {
          handleRaiseToTop();
        }}
      >
        RaiseToTop
      </button>
      <button
        onClick={(): void => {
          handleLowerToBottom();
        }}
      >
        LowerToBottom
      </button>
      <button
        onClick={(): void => {
          handleToglleAll();
        }}
      >
        Toggle All
      </button>
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
        imageryProvider={false}
        sceneModes={[CesiumSceneMode.SCENE2D, CesiumSceneMode.SCENE3D, CesiumSceneMode.COLUMBUS_VIEW]}
        sceneMode={CesiumSceneMode.SCENE2D}
        baseMaps={BASE_MAPS as IBaseMaps}
        // @ts-ignore
        imageryContextMenu={<ContextMenu />}
        imageryContextMenuSize={{ height: 340, width: 200 }}
      >
        <LayersMozaik layers={layers} />
      </CesiumMap>
    </div>
  );
};
