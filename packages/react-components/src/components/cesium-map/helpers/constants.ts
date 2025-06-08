import { getValue } from '../../utils/config';
import { IBaseMaps } from '../settings/settings';

export const BASE_MAPS: IBaseMaps = {
  maps: [
    {
      id: '1st',
      title: '1st Map',
      isCurrent: true,
      thumbnail: 'assets/img/1st.png',
      baseRasterLayers: [
        // {
        //   id: 'GOOGLE_TERRAIN',
        //   type: 'XYZ_LAYER',
        //   opacity: 1,
        //   zIndex: 0,
        //   options: {
        //     url: getValue('GLOBAL', 'BM-GOOGLE_TERRAIN-XYZ_LAYER'),
        //     layers: '',
        //     credit: 'GOOGLE',
        //   },
        // },
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
      thumbnail: 'assets/img/2nd.png',
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
      thumbnail: 'assets/img/3rd.png',
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
