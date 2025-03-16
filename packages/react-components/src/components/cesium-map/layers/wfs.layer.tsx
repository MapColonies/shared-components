import React, { useEffect, useRef, useCallback } from 'react';
import { Cartesian2, Color, Ellipsoid, Entity, GeoJsonDataSource, ScreenSpaceEventHandler, ScreenSpaceEventType } from 'cesium';
import { Feature } from 'geojson';
import { get } from 'lodash';
import { useCesiumMap } from '../map';

const CACHE_MAX_SIZE = 50000; // Size in heap: 500 MB
const CACHE_MAX_TIME = 5; // (minutes)
const CACHE_MAX_DISTANCE = 2500; // (meters) Zoom level 15 = 2.5 meters per pixel
// Calculation was based on: in this area 50K features with area of approximately 200 m each can feet inside

const toDegrees = (coord: number) => (coord * 180) / Math.PI;

type Mapper<T, U> = (item: T, index: number) => Promise<U> | U;

interface PMapOptions {
  concurrency?: number;
  stopOnError?: boolean;
  signal?: AbortSignal;
}

class AggregateError extends Error {
  errors: Error[];

  constructor(errors: Error[], message?: string) {
    super(message);
    this.errors = errors;
    this.name = 'AggregateError';
  }
}

async function pMap<T, U>(
  iterable: Iterable<T> | AsyncIterable<T>,
  mapper: Mapper<T, U>,
  {
    concurrency = Number.POSITIVE_INFINITY,
    stopOnError = true,
    signal,
  }: PMapOptions = {},
): Promise<U[]> {
  return new Promise<U[]>((resolve_, reject_) => {
    if (!(Symbol.iterator in iterable) && !(Symbol.asyncIterator in iterable)) {
      throw new TypeError(`Expected \`input\` to be either an \`Iterable\` or \`AsyncIterable\`, got (${typeof iterable})`);
    }

    if (typeof mapper !== 'function') {
      throw new TypeError('Mapper function is required');
    }

    if (!((Number.isSafeInteger(concurrency) && concurrency >= 1) || concurrency === Number.POSITIVE_INFINITY)) {
      throw new TypeError(`Expected \`concurrency\` to be an integer from 1 and up or \`Infinity\`, got \`${concurrency}\` (${typeof concurrency})`);
    }

    const result: U[] = [];
    const errors: Error[] = [];
    const skippedIndexesMap = new Map<number, any>();
    let isRejected = false;
    let isResolved = false;
    let isIterableDone = false;
    let resolvingCount = 0;
    let currentIndex = 0;
    const iterator = (iterable as Iterable<T>)[Symbol.iterator] === undefined ? (iterable as AsyncIterable<T>)[Symbol.asyncIterator]() : (iterable as Iterable<T>)[Symbol.iterator]();

    const signalListener = () => {
      reject(signal?.reason);
    };

    const cleanup = () => {
      signal?.removeEventListener('abort', signalListener);
    };

    const resolve = (value: U[]) => {
      resolve_(value);
      cleanup();
    };

    const reject = (reason: any) => {
      isRejected = true;
      isResolved = true;
      reject_(reason);
      cleanup();
    };

    if (signal) {
      if (signal.aborted) {
        reject(signal.reason);
      }

      signal.addEventListener('abort', signalListener, { once: true });
    }

    const next = async () => {
      if (isResolved) {
        return;
      }

      const nextItem = await iterator.next();

      const index = currentIndex;
      currentIndex++;

			// Note: `iterator.next()` can be called many times in parallel.
			// This can cause multiple calls to this `next()` function to
			// receive a `nextItem` with `done === true`.
			// The shutdown logic that rejects/resolves must be protected
			// so it runs only one time as the `skippedIndex` logic is
			// non-idempotent.

      if (nextItem.done) {
        isIterableDone = true;

        if (resolvingCount === 0 && !isResolved) {
          if (!stopOnError && errors.length > 0) {
            reject(new AggregateError(errors)); // eslint-disable-line unicorn/error-message
            return;
          }

          isResolved = true;

          if (skippedIndexesMap.size === 0) {
            resolve(result);
            return;
          }

          const pureResult: U[] = [];

					// Support multiple `pMapSkip`'s
          for (const [index, value] of result.entries()) {
            if (skippedIndexesMap.get(index) === pMapSkip) {
              continue;
            }

            pureResult.push(value);
          }

          resolve(pureResult);
        }

        return;
      }

      resolvingCount++;

			// Intentionally detached
      (async () => {
        try {
          const element = await nextItem.value;

          if (isResolved) {
            return;
          }

          const value = await mapper(element, index);

					// Use Map to stage the index of the element
          if (value === pMapSkip) {
            skippedIndexesMap.set(index, value);
          }

          result[index] = value;

          resolvingCount--;
          await next();
        } catch (error) {
          if (stopOnError) {
            reject(error);
          } else {
            errors.push(error as Error);
            resolvingCount--;

						// In that case we can't really continue regardless of `stopOnError` state
						// since an iterable is likely to continue throwing after it throws once.
						// If we continue calling `next()` indefinitely we will likely end up
						// in an infinite loop of failed iteration
            try {
              await next();
            } catch (error) {
              reject(error);
            }
          }
        }
      })();
    };

		// Create the concurrent runners in a detached (non-awaited)
		// promise. We need this so we can await the `next()` calls
		// to stop creating runners before hitting the concurrency limit
		// if the iterable has already been marked as done.
		// NOTE: We *must* do this for async iterators otherwise we'll spin up
		// infinite `next()` calls by default and never start the event loop
    (async () => {
      for (let index = 0; index < concurrency; index++) {
        try {
					// eslint-disable-next-line no-await-in-loop
          await next();
        } catch (error) {
          reject(error);
          break;
        }

        if (isIterableDone || isRejected) {
          break;
        }
      }
    })();
  });
}

interface PMapIterableOptions {
  concurrency?: number;
  backpressure?: number;
}

function pMapIterable<T, U>(
  iterable: Iterable<T> | AsyncIterable<T>,
  mapper: Mapper<T, U>,
  {
    concurrency = Number.POSITIVE_INFINITY,
    backpressure = concurrency,
  }: PMapIterableOptions = {},
): { [Symbol.asyncIterator](): AsyncIterator<U> } {
  if (!(Symbol.iterator in iterable) && !(Symbol.asyncIterator in iterable)) {
    throw new TypeError(`Expected \`input\` to be either an \`Iterable\` or \`AsyncIterable\`, got (${typeof iterable})`);
  }

  if (typeof mapper !== 'function') {
    throw new TypeError('Mapper function is required');
  }

  if (!((Number.isSafeInteger(concurrency) && concurrency >= 1) || concurrency === Number.POSITIVE_INFINITY)) {
    throw new TypeError(`Expected \`concurrency\` to be an integer from 1 and up or \`Infinity\`, got \`${concurrency}\` (${typeof concurrency})`);
  }

  if (!((Number.isSafeInteger(backpressure) && backpressure >= concurrency) || backpressure === Number.POSITIVE_INFINITY)) {
    throw new TypeError(`Expected \`backpressure\` to be an integer from \`concurrency\` (${concurrency}) and up or \`Infinity\`, got \`${backpressure}\` (${typeof backpressure})`);
  }

  return {
    async * [Symbol.asyncIterator]() {
      const iterator = (iterable as AsyncIterable<T>)[Symbol.asyncIterator] !== undefined 
        ? (iterable as AsyncIterable<T>)[Symbol.asyncIterator]() 
        : (iterable as Iterable<T>)[Symbol.iterator]();

      const promises: Promise<any>[] = [];
      let runningMappersCount = 0;
      let isDone = false;
      let index = 0;

      function trySpawn() {
        if (isDone || !(runningMappersCount < concurrency && promises.length < backpressure)) {
          return;
        }

        const promise = (async () => {
          const { done, value } = await iterator.next();

          if (done) {
            return { done: true };
          }

          runningMappersCount++;

					// Spawn if still below concurrency and backpressure limit
          trySpawn();

          try {
            const returnValue = await mapper(await value, index++);

            runningMappersCount--;

            if (returnValue === pMapSkip) {
              // @ts-ignore
              const index = promises.indexOf(promise);
              if (index > 0) {
                promises.splice(index, 1);
              }
            }

						// Spawn if still below backpressure limit and just dropped below concurrency limit
            trySpawn();

            return { done: false, value: returnValue };
          } catch (error) {
            isDone = true;
            return { error };
          }
        })();

        promises.push(promise);
      }

      trySpawn();

      while (promises.length > 0) {
        const { error, done, value } = await promises[0]; // eslint-disable-line no-await-in-loop

        promises.shift();

        if (error) {
          throw error;
        }

        if (done) {
          return;
        }

				// Spawn if just dropped below backpressure limit and below the concurrency limit
        trySpawn();

        if (value === pMapSkip) {
          continue;
        }

        yield value;
      }
    },
  };
}

async function processArrayWithConcurrency<T>(
  array: T[],
  concurrency: number,
  processFn: Mapper<T, any>,
): Promise<void> {
  await pMap(array, processFn, { concurrency });
}

const pMapSkip = Symbol('skip');

export interface CesiumWFSLayerOptions {
  url: string;
  featureType: string;
  style: Record<string, unknown>;
  pageSize: number;
  zoomLevel: number;
  meta?: Record<string, unknown>;
  sortBy?: string;
  shouldFilter?: boolean;
}

export interface CesiumWFSLayerProps {
  options: CesiumWFSLayerOptions;
}

export const CesiumWFSLayer: React.FC<CesiumWFSLayerProps> = ({ options }) => {
  const { url, featureType, style, pageSize, zoomLevel, meta, sortBy, shouldFilter } = options;
  const mapViewer = useCesiumMap();
  const wfsCache = useRef(new Set<string>());
  const page = useRef(0);
  const wfsDataSource = new GeoJsonDataSource('wfs');

  const fetchAndUpdateWfs = useCallback(async (offset = 0) => {
    if (!mapViewer) { return; }

    const bbox = mapViewer.camera.computeViewRectangle(Ellipsoid.WGS84);
    if (!bbox) { return; }

    if (!mapViewer.currentZoomLevel || mapViewer.currentZoomLevel as number <= zoomLevel) {
      if (wfsDataSource.entities && wfsDataSource.entities.values.length > 0) {
        wfsDataSource.show = false;
        page.current = 0;
      }
      return;
    }

    wfsDataSource.show = true;
    console.log('cache size: ', wfsCache.current.size);

    const filterSection = shouldFilter ? `
      <fes:Filter>
        <fes:And>
          <fes:Intersects>
            <fes:ValueReference>geom</fes:ValueReference>
            <gml:Polygon srsName="EPSG:4326">
              <gml:exterior>
                <gml:LinearRing>
                  <gml:posList>
                    ${toDegrees(bbox.west)} ${toDegrees(bbox.south)} ${toDegrees(bbox.west)} ${toDegrees(bbox.north)} ${toDegrees(bbox.east)} ${toDegrees(bbox.north)} ${toDegrees(bbox.east)} ${toDegrees(bbox.south)} ${toDegrees(bbox.west)} ${toDegrees(bbox.south)}
                  </gml:posList>
                </gml:LinearRing>
              </gml:exterior>
            </gml:Polygon>
          </fes:Intersects>
        </fes:And>
      </fes:Filter>` : '';

    const req_body_xml = `<wfs:GetFeature
      xmlns:wfs="http://www.opengis.net/wfs/2.0"
      xmlns:fes="http://www.opengis.net/fes/2.0"
      xmlns:gml="http://www.opengis.net/gml/3.2"
      xmlns:sf="http://www.openplans.org/spearfish"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      service="WFS" 
      version="2.0.0"
      xsi:schemaLocation="http://www.opengis.net/wfs/2.0
      http://schemas.opengis.net/wfs/2.0/wfs.xsd 
      http://www.opengis.net/gml/3.2 
      http://schemas.opengis.net/gml/3.2.1/gml.xsd" 
      outputFormat="application/json">
      <wfs:Query typeNames="${featureType}">
        ${filterSection}
        <wfs:SortBy>
          <wfs:SortProperty>
            <wfs:ValueReference>${sortBy}</wfs:ValueReference>
            <wfs:SortOrder>ASC</wfs:SortOrder>
          </wfs:SortProperty>
        </wfs:SortBy>
      </wfs:Query>
      <wfs:Count>${pageSize}</wfs:Count>
      <wfs:StartIndex>${offset}</wfs:StartIndex>
    </wfs:GetFeature>`;

    const response = await fetch(url, {
      method: 'POST',
      body: req_body_xml
    });
    const layer = await response.json();

    const newFeatures = layer.features.filter((f: Feature) => !wfsCache.current.has(f.properties?.osm_id));
    
    if (newFeatures.length === 0) {
      if (layer.numberReturned !== 0) {
        fetchAndUpdateWfs(page.current++ * pageSize);
      } else {
        page.current = 0;
      }
      return;
    }

    newFeatures.forEach((f: Feature) => {
      wfsCache.current.add(f.properties?.osm_id);
    });

    processArrayWithConcurrency(
      wfsDataSource.entities.values,
      10,
      (item: Entity, idx: number) => {
        if (idx % 2) {
          wfsDataSource.entities.remove(item);
        };
      }
    ); 

    const newGeoJson = {
      type: "FeatureCollection",
      features: newFeatures
    };

    await wfsDataSource.process(newGeoJson, style);
    mapViewer.scene.requestRender();
    if (layer.numberReturned !== 0) {
      fetchAndUpdateWfs(page.current++ * pageSize);
    } else {
      page.current = 0;
    }
  }, [mapViewer.currentZoomLevel]);

  useEffect(() => {
    mapViewer.dataSources.add(wfsDataSource);

    const fetchHandler = () => {
      fetchAndUpdateWfs();
    };
    mapViewer.scene.camera.moveEnd.addEventListener(fetchHandler);

    let hoveredEntity: any = null;
    const handler = new ScreenSpaceEventHandler(mapViewer.scene.canvas);
    handler.setInputAction((movement: { endPosition: Cartesian2; }) => {
      const pickedObject = mapViewer.scene.pick(movement.endPosition);
      if (pickedObject && pickedObject.id && pickedObject.id.polygon) {
        if (hoveredEntity !== pickedObject.id) {
          if (hoveredEntity) {
            hoveredEntity.polygon.material = style.fill;
          }
          hoveredEntity = pickedObject.id;
          hoveredEntity.polygon.material = Color.BLUE.withAlpha(0.8);
        }
      } else {
        if (hoveredEntity) {
          hoveredEntity.polygon.material = style.fill;
          hoveredEntity = null;
        }
      }
    }, ScreenSpaceEventType.MOUSE_MOVE);

    return () => {
      if (get(mapViewer, '_cesiumWidget') != undefined) {
        mapViewer.scene.camera.moveEnd.removeEventListener(fetchHandler);
        handler.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
      }
    };
  }, []);

  return null;
};
