import type ImageTile from 'ol/ImageTile';
import type { LoadFunction } from 'ol/Tile';
import TileState from 'ol/TileState';
import type { InjectedAuth } from '../hydration';

export const appendAuthQueryParameters = (url: string, auth?: InjectedAuth): string => {
  const query = Object.entries(auth?.queryParameters ?? {})
    .map(([name, value]) => `${encodeURIComponent(name)}=${encodeURIComponent(value)}`)
    .join('&');
  return query ? `${url}${url.includes('?') ? '&' : '?'}${query}` : url;
};

/**
 * An OL `tileLoadFunction` that sends the headers of `auth` with every tile request: an `<img>` cannot send headers, so the tile
 * is fetched and handed to the image as an object URL. `undefined` when `auth` has no headers, OL's own image loading is used then.
 * Cross-origin servers must allow the headers (CORS preflight).
 */
export const createAuthTileLoadFunction = (auth?: InjectedAuth): LoadFunction | undefined => {
  const headers = auth?.headers;
  if (!headers || Object.keys(headers).length === 0) {
    return undefined;
  }
  return (tile, src) => {
    const image = (tile as ImageTile).getImage() as HTMLImageElement;
    fetch(src, { headers })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Tile request failed with status ${response.status}`);
        }
        return response.blob();
      })
      .then((blob) => {
        const objectUrl = URL.createObjectURL(blob);
        const revoke = (): void => URL.revokeObjectURL(objectUrl);
        image.addEventListener('load', revoke, { once: true });
        image.addEventListener('error', revoke, { once: true });
        image.src = objectUrl;
      })
      .catch((err) => {
        // Consider using the source's "tileloaderror" event for comprehensive error handling.
        tile.setState(TileState.ERROR);
        console.error('[React-Components][OpenLayers][tileLoadFunction][createAuthTileLoadFunction]: ', err);
      });
  };
};
