import { useState } from 'react';
import type { StoryFn, Meta } from '@storybook/react';
import { action } from 'storybook/actions';
import { Cesium3DTileStyle, Rectangle } from 'cesium';
import { BASE_MAPS } from '../helpers/constants';
import { CesiumMap } from '../map';
import { CesiumMVTDataProviderWGS84 } from './mvt-data-provider-wgs84';
import type { MVTDataProviderWGS84Shape } from '../helpers/mvt';

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

// OGC API - Tiles source, WGS1984Quad tile matrix set (EPSG:4326), placeholders in {z}/{y}/{x} order.
// This particular dev/PoC deployment's low-zoom tiles (z=0, and part of z=1) return HTTP 500 - a
// server-side SQL bug ("column \"inf\" does not exist"), unrelated to this client. Those error
// responses also fail at the network level in-browser (net::ERR_CONTENT_DECODING_FAILED, likely a
// Content-Encoding header that doesn't match the actual error body), so Cesium never sees a usable
// HTTP status for them either. `refine: 'ADD'` in mvtDataProviderWGS84.ts is what tolerates this:
// under the standard 3D Tiles `REPLACE` refinement, a single permanently-failing tile blocks every
// tile beneath it from ever being selected, however successfully its siblings load. The tradeoff is
// visible here too - since ADD can render multiple zoom levels of the same area at once, a small
// feature (e.g. an island) can appear to shift/duplicate where its differently-simplified outline at
// each loaded zoom doesn't quite line up. Cyprus is a concrete example: decoding this dataset's raw
// z=3/z=4/z=5 tiles directly shows its coastline is missing (not just simplified differently) from
// the "ocean" layer's hole/cutout at those zooms, while it's present and correct once zoomed in far
// enough (z=8+) to fetch tiles that do carry it - a data-generation gap on the server, not a
// coordinate bug here. Fixing the server (all three issues) is what actually resolves this.
const MVT_URL =
  'https://vector-tiles-poc-shigola-vector-dev.apps.j1lk3njp.eastus.aroapp.io/collections/osm:ocean/tiles/WorldCRS84Quad/{z}/{y}/{x}?f=pbf'; //WorldCRS84Quad //WGS1984Quad

export const MapWithMVTDataProviderWGS84: StoryFn = () => {
  const [center] = useState<[number, number]>([34.82, 32.04]);
  return (
    <div style={mapDivStyle}>
      <CesiumMap center={center} baseMaps={BASE_MAPS} zoom={5} layerManagerMetaMapping={layerManagerMetaMapping}>
        <CesiumMVTDataProviderWGS84
          url={MVT_URL}
          onReady={(provider: MVTDataProviderWGS84Shape): void => {
            action('onReady')(provider);
            // MVTDataProviderWGS84 (like Cesium's own MVTDataProvider) applies no default color -
            // feature styling is left to the tileset's `style`, same as any other 3D Tiles content.
            if (provider.tileset !== undefined) {
              provider.tileset.style = new Cesium3DTileStyle({ color: 'color("cornflowerblue", 0.6)' });
            }
          }}
          onError={action('onError')}
          maxZoom={8}
          // Rectangle.fromDegrees is (west, south, east, north) - this box covers Cyprus with margin.
          extent={Rectangle.fromDegrees(31.04375032220455, 33.935900786294766, 35.370046052488185, 37.31497959426475)}
        />
      </CesiumMap>
    </div>
  );
};
MapWithMVTDataProviderWGS84.storyName = 'MVT Data Provider WGS84';
