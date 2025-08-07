import { getValue } from '../../utils/config';
import { IBaseMaps } from '../map';

export const DEFAULT_TERRAIN_PROVIDER_URL = getValue('GLOBAL', 'DEFAULT_TERRAIN_PROVIDER_URL');
export const TERRAIN_SRTM100 = getValue('GLOBAL', 'TERRAIN_SRTM100');
export const TERRAIN_COMBINED = getValue('GLOBAL', 'TERRAIN_COMBINED');

export const BASE_MAPS: IBaseMaps = {
  maps: [
    {
      id: '1st',
      title: '1st Map',
      isCurrent: true,
      thumbnail: 'https://mt1.google.com/vt/lyrs=s&x=6&y=4&z=3',
      baseRasterLayers: [
        {
          id: 'GOOGLE_TERRAIN',
          type: 'XYZ_LAYER',
          opacity: 1,
          zIndex: 0,
          options: {
            url: getValue('GLOBAL', 'BM-GOOGLE_TERRAIN-XYZ_LAYER'),
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
            url: getValue('GLOBAL', 'BM-INFRARED_RASTER-WMS_LAYER'),
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
      title: '2nd Map',
      thumbnail: 'https://mt1.google.com/vt/lyrs=s&x=6&y=4&z=3',
      baseRasterLayers: [
        {
          id: 'RADAR_RASTER',
          type: 'WMS_LAYER',
          opacity: 0.6,
          zIndex: 1,
          options: {
            url: getValue('GLOBAL', 'BM-RADAR_RASTER-WMS_LAYER'),
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
            url: getValue('GLOBAL', 'BM-GOOGLE_TERRAIN-XYZ_LAYER'),
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
            url: getValue('GLOBAL', 'BM-VECTOR_TILES_GPS-XYZ_LAYER'),
            layers: '',
            credit: 'openstreetmap',
          },
        },
      ],
      baseVectorLayers: [],
    },
    {
      id: '3rd',
      title: '3rd Map',
      thumbnail: 'https://a.tile.thunderforest.com/cycle/17/78208/53265.png',
      baseRasterLayers: [
        {
          id: 'VECTOR_TILES',
          type: 'XYZ_LAYER',
          opacity: 1,
          zIndex: 0,
          options: {
            url: getValue('GLOBAL', 'BM-VECTOR_TILES-XYZ_LAYER'),
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
            url: getValue('GLOBAL', 'BM-VECTOR_TILES_GPS-XYZ_LAYER'),
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
            url: getValue('GLOBAL', 'BM-WMTS_POPULATION_TILES-WMTS_LAYER'),
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
