import path from 'path';
import { PluginOption, defineConfig, UserConfig, loadEnv } from 'vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import pluginReact from '@vitejs/plugin-react';
import eslintPlugin from 'vite-plugin-eslint2';
import dts from 'vite-plugin-dts';

const isExternal = (id: string) => !id.startsWith('.') && !path.isAbsolute(id);

export const getBaseConfig = ({ plugins = [] as PluginOption[], lib, additionalConfig = {} as UserConfig }) => {
  return defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    return {
      plugins: [
        pluginReact(),
        eslintPlugin({
          cache: false,
          include: ['./src/components/**/*.ts', './src/components/**/*.tsx'],
          exclude: ['/virtual:/', '/node_modules/'],
        }),
        dts({
          include: ['src'],
          tsconfigPath: 'tsconfig-build.json',
          rollupTypes: true,
        }),
        cssInjectedByJsPlugin(),
        ...plugins,
      ],
      build: {
        lib,
        rollupOptions: {
          external: isExternal,
          output: {
            globals: {
              cesium: 'Cesium',
              react: 'React',
              'react-dom': 'ReactDOM',
              'date-fns': 'dateFns',
              'date-fns/locale': 'datesFnsLocale',
              '@date-io/date-fns': 'dateIoDateFns',
              '@material-ui/pickers': 'materialUiPickers',
              '@material-ui/core': 'MaterialUI',
              '@material-ui/core/styles': 'MaterialUIStyles',
              '@map-colonies/react-core': 'mapColoniesReactCore',
              'react/jsx-runtime': 'reactJsxRuntime',
              '@material-ui/core/useMediaQuery': 'materialUiUseMediaQuery',
              'react-datepicker': 'reactDatepicker',
              'date-fns/locale/he': 'dateFnsLocaleHe',
              moment: 'moment',
              '@turf/rewind': 'turfRewind',
              ol: 'ol',
              'ol/ol.css': 'olCss',
              'ol/coordinate': 'olCoordinate',
              'ol/control': 'olControl',
              'ol/control/MousePosition': 'olControlMousePosition',
              'ol/proj': 'olProj',
              'ol/layer': 'olLayer',
              'ol/source': 'olSource',
              'ol/format': 'olFormat',
              'ol/interaction': 'olInteraction',
              'ol/interaction/Draw': 'olInteractionDraw',
              'ol/layer/VectorTile': 'olLayerVectorTile',
              'ol/style': 'olStyle',
              'ol/tilegrid/WMTS': 'olTilegridWMTS',
              'ol/extent': 'olExtent',
              'ol/source/TileWMS': 'olSourceTileWMS',
              'ol/source/XYZ': 'olSourceXYZ',
              'ol/source/VectorTile': 'olSourceVectorTile',
              'ol-ext/legend/Legend': 'olExtLegendLegend',
              'ol-ext/control/Legend': 'olExtControlLegend',
              'ol-ext/dist/ol-ext.css': 'olExtCss',
              '@material-ui/core/TableHead': 'materialUiTableHead',
              '@material-ui/core/utils': 'materialUiUtils',
              '@material-ui/core/CssBaseline': 'materialUiCssBaseline',
              '@material-ui/core/ScopedCssBaseline': 'materialUiScopedCssBaseline',
              resium: 'resium',
              lodash: 'lodash',
              '@turf/bbox': 'turfBbox',
              '@turf/boolean-point-in-polygon': 'turfBooleanPointInPolygon',
              '@turf/area': 'turfArea',
              '@turf/bbox-polygon': 'turfBboxPolygon',
              '@turf/centroid': 'turfCentroid',
              '@turf/helpers': 'turfHelpers',
              '@turf/intersect': 'turfIntersect',
              '@turf/point-to-polygon-distance': 'turfPointToPolygonDistance',
              '@turf/invariant': 'turfInvariant',
              '@map-colonies/react-core/dist/list/styles': 'mapColoniesReactCoreListStyles',
              '@map-colonies/react-core/dist/textfield/styles': 'mapColoniesReactCoreTextfieldStyles',
              '@cmcleese/cesium-navigation': 'cmcleeseNavigationPlugin',
              '@cmcleese/cesium-navigation/dist/index.css': 'cmcleeseNavigationPluginCss',
              '@map-colonies/react-core/dist/linear-progress/styles': 'mapColoniesReactCoreLinearProgressStyles',
              '@map-colonies/react-core/dist/checkbox/styles': 'mapColoniesReactCoreCheckboxStyles',
              'p-map': 'pMap',
              uuid: 'uuid',
              '@turf/boolean-valid': 'turfBooleanValid',
              'textarea-caret': 'textareaCaret',
              'get-input-selection': 'getInputSelection',
              chonky: 'chonky',
              'chonky-icon-fontawesome': 'chonkyIconFontawesome',
              filesize: 'filesize',
              'react-select': 'reactSelect',
              'react-circular-progressbar': 'reactCircularProgressbar',
              'react-circular-progressbar/dist/styles.css': 'reactCircularProgressbarStyles',
              'react-move': 'reactMove',
            },
          },
        },
      },
      define: {
        'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development'),
        CESIUM_BASE_URL: JSON.stringify(env.CESIUM_BASE_URL),
      },
      ...additionalConfig,
    };
  });
};
