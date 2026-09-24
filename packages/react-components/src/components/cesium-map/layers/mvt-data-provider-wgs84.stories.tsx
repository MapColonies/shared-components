import { useEffect, useState } from 'react';
import type { StoryFn, Meta } from '@storybook/react';
import { action } from 'storybook/actions';
import { Cesium3DTileStyle, Rectangle } from 'cesium';
import { BASE_MAPS } from '../helpers/constants';
import { CesiumMap, useCesiumMap } from '../map';
import { CesiumMVTDataProviderWGS84 } from './mvt-data-provider-wgs84';
import type { MVTDataProviderWGS84Shape } from '../helpers/mvt';
import { VECTOR_TILE_STYLE } from '../helpers/mvt/shortbread-cesium3dtile-style-claude';
import { CesiumColor } from '../proxied.types';
// import { VECTOR_TILE_STYLE } from '../helpers/mvt/shortbread-cesium3dtile-style-direct';

export default {
  title: 'Cesium Map/Layers/MVTDataProviderWGS84',
  component: CesiumMVTDataProviderWGS84,
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

// Per-feature-class styling built around OpenMapTiles' `class` property
// (preserved through the MVT→3D Tiles conversion as EXT_structural_metadata
// per the 1.142 changelog). Without this, every feature comes through with
// no visible fill and the viewer renders an empty tile tree.
// `${class}` is `undefined` for any feature/layer in this collection that doesn't carry a `class`
// property (not every OpenMapTiles-style layer does). Plain `===` comparisons handle `undefined`
// safely, but the styling language's `regExp(...).test(...)` throws unless its argument is actually a
// string (see Expression.js#_evaluateRegExpTest) - wrapping with the style language's own `String(...)`
// conversion coerces a missing property to the literal string "undefined", which just falls through to
// the catch-all condition below instead of crashing the whole tileset's style evaluation.
const VECTOR_TILE_STYLE_LOCAL = new Cesium3DTileStyle({
  color: {
    conditions: [
      // Buildings get a warm tan; alpha=1 so extrusions read as solid
      ["${class} === 'building'", "color('#bcaa90', 1.0)"],
      // Water layers (ocean, river, lake, sea, bay)
      ["regExp('^(water|ocean|river|lake|sea|bay|stream)$').test(String(${kind}))", "color('#3892c4', 0.85)"],
      // Green spaces (park, wood, forest, grass, farmland, cemetery)
      ["regExp('^(park|wood|forest|grass|farmland|cemetery|playground|garden|nature_reserve)$').test(String(${class}))", "color('#7cc26b', 0.7)"],
      // Major roads (motorway, trunk, primary, secondary, tertiary)
      ["regExp('^(motorway|trunk|primary|secondary|tertiary|major)$').test(String(${class}))", "color('#fbd870', 0.95)"],
      // Built-up urban landuse
      ["regExp('^(residential|commercial|industrial|retail|school|hospital|university)$').test(String(${class}))", "color('#dec8a8', 0.55)"],
      // Default: light beige (fallback for unclassified features)
      ['true', "color('#e8d8c0', 0.45)"],
    ],
  },
});

// OGC API - Tiles source, WGS1984Quad tile matrix set (EPSG:4326), placeholders in {z}/{y}/{x} order.
// This dev/PoC deployment previously had two server-side bugs at low zoom (z=0, part of z=1): a SQL
// error ("column \"inf\" does not exist") returning HTTP 500, and those error responses also failing
// at the network level in-browser (net::ERR_CONTENT_DECODING_FAILED - likely a Content-Encoding header
// mismatch on the error path), so Cesium never saw a usable HTTP status for them either. Both are now
// fixed server-side, so this uses the default `refine: 'REPLACE'` (single clean LOD per area, no
// overdraw) - `refine="ADD"` remains available on `CesiumMVTDataProviderWGS84` for a server that still
// has that failure mode. One data issue remains at very coarse zoom: Cyprus's coastline is missing
// from the "ocean" layer's hole/cutout at z=3-5 zoomed out over the *whole* globe, though present and
// correct once tiles are fetched at native detail - the `extent` below keeps this demo at a zoom depth
// where that doesn't come up.
const MVT_URL = 'https://vector-tiles-poc-shigola-vector-dev.apps.j1lk3njp.eastus.aroapp.io/collections/osm/tiles/WGS1984Quad/{z}/{y}/{x}?f=pbf';

export const MapWithMVTDataProviderWGS84: StoryFn = () => {
  const [center] = useState<[number, number]>([35.55099, 31.75601]);

  const BacgroundChanger: React.FC = () => {
    const mapViewer = useCesiumMap();

    useEffect(() => {
      if (mapViewer.scene) {
        mapViewer.scene.globe.baseColor = CesiumColor.WHITESMOKE;
      }
    }, [mapViewer.scene]);

    return <></>;
  };

  return (
    <div style={mapDivStyle}>
      <CesiumMap center={center} /*baseMaps={BASE_MAPS}*/ zoom={7} layerManagerMetaMapping={layerManagerMetaMapping}>
        <BacgroundChanger />
        <CesiumMVTDataProviderWGS84
          url={MVT_URL}
          onReady={(provider: MVTDataProviderWGS84Shape): void => {
            action('onReady')(provider);
            // MVTDataProviderWGS84 (like Cesium's own MVTDataProvider) applies no default color -
            // feature styling is left to the tileset's `style`, same as any other 3D Tiles content.
            if (provider.tileset !== undefined) {
              // provider.tileset.style = new Cesium3DTileStyle({ color: 'color("cornflowerblue", 0.6)' });
              provider.tileset.style = VECTOR_TILE_STYLE;
            }
          }}
          onError={action('onError')}
          maxZoom={8}
          placeLabels
          lineSmoothingIterations={2}
          //****  Rectangle.fromDegrees is (west, south, east, north) - this box covers Cyprus with margin.
          //extent={Rectangle.fromDegrees(31.04375032220455, 33.935900786294766, 35.370046052488185, 37.31497959426475)}

          //***** Israel with margin
          extent={Rectangle.fromDegrees(33.865440557094274, 29.778191378996056, 36.17054670724658, 33.45909286651407)}
        />
      </CesiumMap>
    </div>
  );
};
MapWithMVTDataProviderWGS84.storyName = 'MVT Data Provider WGS84';
