import { useEffect, useMemo, useState } from 'react';
import { useCesiumMap } from '../map';
import {
  Cartesian2,
  Cartesian3,
  Cartographic,
  defined,
  Entity,
  GeoJsonDataSource,
  HeightReference,
  Ray,
  Rectangle,
  Viewer,

} from 'cesium';
import { IconButton, TextField, Typography, Checkbox, List, ListItem, ListItemSecondaryText } from '@map-colonies/react-core';
import { computeLimitedViewRectangle, defaultVisualizationHandler, rectangle2bbox } from '../helpers/utils';
import { debounce, get } from 'lodash';
import bbox from '@turf/bbox';
import { CesiumRectangle } from '../proxied.types';
import { Box } from '../../box';

import './geocoder-panel.css';
import '@map-colonies/react-core/dist/list/styles';


export type Method = 'GET' | 'POST';

export type CesiumGeocodingPropsPayload = {
  baseUrl: string,
  endPoint: string,
  url?: string,
  method: Method,
  headers?: Record<string, string>,
  params: {
    dynamic: {
      queryText: string,
      geoContext?: string
    },
    static: Record<string, unknown>
  },
  icon: string,
  title: string
}

export type GeocoderPanelProps = {
  configs: CesiumGeocodingPropsPayload[];
  locale?: { [key: string]: string };
}

export const GeocoderPanel: React.FC<GeocoderPanelProps> = ({ configs, locale }) => {
  const mapViewer = useCesiumMap();
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isInMapExtent, setIsInMapExtent] = useState(false);
  const [showFeatureOnMap, setShowFeatureOnMap] = useState(false);
  const showFeatureOnMapLabel = useMemo(() => get(locale, 'SHOW_FEATURE_ON_MAP') ?? 'Show feature on map', [locale]);
  const inMapExtentLabel = useMemo(() => get(locale, 'IN_MAP_EXTENT') ?? 'Search in map extent', [locale]);
  const searchPlaceholder = useMemo(() => get(locale, 'SEARCH_PLACEHOLDER') ?? 'Search...', [locale]);
  const noResults = useMemo(() => get(locale, 'NO_RESULTS') ?? 'No Results', [locale]);
  const [searchResults, setSearchResults] = useState<{ resultObj: any; url: string; }[]>();
  const [cesiumEntityOnMap, setCesiumEntityOnMap] = useState<Entity>();
  const [featureToShow, setFeatureToShow] = useState();

  useEffect(() => {
    configs.forEach((config: CesiumGeocodingPropsPayload) => {
      config.url = config.baseUrl + config.endPoint;
    })
  }, [configs]);

  useEffect(() => {
    if (featureToShow) {
      if (showFeatureOnMap) {
        drawFeature(featureToShow);
      }
      // else if (cesiumEntityOnMap) {
      //   mapViewer.entities.remove(cesiumEntityOnMap);
      // }
    }

  }, [showFeatureOnMap])

  const addParamToUrl = (url: string, key: string, value: unknown): string => {
    const stringValue = valueToString(value);
    if (stringValue) {
      url += `&${key}=${encodeURIComponent(stringValue)}`
    }

    return url;
  }

  const getAccurateViewRectangle = (viewer: Viewer) => {
    const scene = viewer.scene;
    const canvas = scene.canvas;

    // Get four corners in screen space
    const topLeft = new Cartesian2(0, 0);
    const topRight = new Cartesian2(canvas.clientWidth, 0);
    const bottomLeft = new Cartesian2(0, canvas.clientHeight);
    const bottomRight = new Cartesian2(canvas.clientWidth, canvas.clientHeight);

    // Convert corners to cartographic positions (lon/lat/height)
    const positions = [topLeft, topRight, bottomLeft, bottomRight]
      .map(screenPos => scene.camera.getPickRay(screenPos))
      .filter((ray): ray is Ray => defined(ray))
      .map(ray => scene.globe.pick(ray, scene))
      .filter((pos): pos is Cartesian3 => defined(pos))
      .map(cartesian => Cartographic.fromCartesian(cartesian));

    if (!positions.length) return undefined;

    // Compute min/max for rectangle
    let west = Number.POSITIVE_INFINITY;
    let south = Number.POSITIVE_INFINITY;
    let east = Number.NEGATIVE_INFINITY;
    let north = Number.NEGATIVE_INFINITY;

    positions.forEach(pos => {
      west = Math.min(west, pos.longitude);
      south = Math.min(south, pos.latitude);
      east = Math.max(east, pos.longitude);
      north = Math.max(north, pos.latitude);
    });

    return new Rectangle(west, south, east, north);
  }

  const buildUrlParams = (url: string, params: CesiumGeocodingPropsPayload['params'], text: string) => {
    const dynamicParams = () => {
      url = addParamToUrl(url, params.dynamic.queryText, text);

      if (isInMapExtent) {
        const rectangle = getAccurateViewRectangle(mapViewer);

        // const rectangle = computeLimitedViewRectangle(mapViewer);

        if (rectangle && params?.dynamic?.geoContext) {
          const rectangle2bboxVal = rectangle2bbox(rectangle);
          const bbox = {
            bbox: [
              rectangle2bboxVal[0],
              rectangle2bboxVal[1],
              rectangle2bboxVal[2],
              rectangle2bboxVal[3]
            ]
          };

          url = addParamToUrl(url, params.dynamic.geoContext, bbox);
        }
      }
    }

    const staticParams = () => {
      for (const [key, value] of Object.entries(params.static)) {
        if (key === 'geo_context_mode' && (!isInMapExtent || params.dynamic.geoContext === undefined || !url.includes(params.dynamic.geoContext))) continue;
        url = addParamToUrl(url, key, value);
      }

      return url;
    }

    url += '?';
    dynamicParams();
    staticParams();

    const questionMarkPosition = url.indexOf('?');
    url = url.slice(0, questionMarkPosition) + '?' + url.slice(questionMarkPosition + 2);

    return url;
  }

  const debouncedSearch = useMemo(() => debounce((value: string) => {
    fetchData(value);
  }, 400), []);

  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);

  // useEffect(() => {
  //   fetchData();
  // }, [searchValue, isInMapExtent])

  async function fetchData(text: string) {
    const queryPromises = configs.map(async (config) => {
      if (config.url) {
        const url = buildUrlParams(config.url, config.params, text);
        return fetch(url, { method: 'GET' });
      }
    });

    const responses = await Promise.all(queryPromises);
    const jsonResponses = await Promise.all(
      responses.map(async (res) => {
        if (res === undefined) return;
        const resultObj = await res.json();
        return {
          resultObj,
          url: res.url
        };
      })
    );

    if (jsonResponses) {
      const cleaned = jsonResponses.filter((item): item is { resultObj: any, url: string } => item !== undefined)
      setSearchResults(cleaned);
    }
  }

  const valueToString = (value: unknown): string | undefined => {
    switch (typeof value) {
      case 'object':
        if (Array.isArray(value)) {
          return `[${value.map((item: string) => `'${item}'`).join(', ')}]`;
        } else {
          return JSON.stringify(value);
        }
      case 'boolean':
      case 'number':
      case 'string':
        return value.toString();
      case 'undefined':
        return undefined;
      case 'symbol':
      case 'function':
        throw new Error(`unsupported value type: ${typeof value}`);
    }
  };

  const svg = `<svg class="cesium-svgPath-svg" width="32" height="32" fill="white" viewBox="0 0 32 32">
  <path d="M29.772,26.433l-7.126-7.126c0.96-1.583,1.523-3.435,1.524-5.421C24.169,8.093,19.478,3.401,13.688,3.399C7.897,3.401,3.204,8.093,3.204,13.885c0,5.789,4.693,10.481,10.484,10.481c1.987,0,3.839-0.563,5.422-1.523l7.128,7.127L29.772,26.433zM7.203,13.885c0.006-3.582,2.903-6.478,6.484-6.486c3.579,0.008,6.478,2.904,6.484,6.486c-0.007,3.58-2.905,6.476-6.484,6.484C10.106,20.361,7.209,17.465,7.203,13.885z"></path>
</svg>`;

  // Convert the SVG to a data URL
  const svgDataUrl = `data:image/svg+xml;base64,${btoa(svg)}`;

  const drawFeature = async (feature: any) => {

    // const coords = feature.geometry.coordinates[0];

    // const flatCoords: number[] = coords.flat();


    // // mapViewer.entities.removeAll();
    // if (cesiumEntityOnMap) {
    //   mapViewer.entities.remove(cesiumEntityOnMap);
    // }

    // const entityToShowOnMap = mapViewer.entities.add({
    //   properties: {
    //     kuku: 'kuku',
    //     muku: 534
    //   },//feature.properties,
    //   polygon: {
    //     hierarchy: new Cesium.PolygonHierarchy(
    //       Cesium.Cartesian3.fromDegreesArray(
    //         flatCoords
    //       )),
    //     height: 0,
    //     material: Cesium.Color.RED.withAlpha(0.5),
    //     outline: true,
    //     outlineColor: Cesium.Color.BLACK,
    //   },
    // });

    // setCesiumEntityOnMap(entityToShowOnMap);


    const dataSource = new GeoJsonDataSource('dataSourceName');
    mapViewer.dataSources.add(dataSource);


    const newGeoJson = {
      type: 'FeatureCollection',
      features: [feature],
    };

    await dataSource.load(newGeoJson, /*{ describe }*/);

    defaultVisualizationHandler(mapViewer, dataSource, [], '#01FF1F');



    // mapViewer.zoomTo(entityToShowOnMap);



    // const rectangle = mapViewer.entities.add({
    //   rectangle: {
    //     coordinates: geometry,
    //     material: CesiumColor.PURPLE
    //   },
    // });
  };

  const getIconByFeatureType = () => {
    return CheckedIcon;
  };

  const UncheckedIcon = (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <rect
        x="0"
        y="0"
        width="16"
        height="16"
        rx="2"
        ry="2"
        fill="white"
        stroke="#ccc"
        strokeWidth="1"
      />
    </svg>
  );

  const CheckedIcon = (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <rect
        x="0"
        y="0"
        width="16"
        height="16"
        rx="2"
        ry="2"
        fill="#1976d2"
        stroke="#1976d2"
        strokeWidth="1"
      />
      <path
        d="M4 8l2 2 6-6"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const SearchIcon = (
    <svg className="cesium-svgPath-svg" width="32" height="32" fill='white' viewBox="0 0 32 32">
      <path d="M29.772,26.433l-7.126-7.126c0.96-1.583,1.523-3.435,1.524-5.421C24.169,8.093,19.478,3.401,13.688,3.399C7.897,3.401,3.204,8.093,3.204,13.885c0,5.789,4.693,10.481,10.484,10.481c1.987,0,3.839-0.563,5.422-1.523l7.128,7.127L29.772,26.433zM7.203,13.885c0.006-3.582,2.903-6.478,6.484-6.486c3.579,0.008,6.478,2.904,6.484,6.486c-0.007,3.58-2.905,6.476-6.484,6.484C10.106,20.361,7.209,17.465,7.203,13.885z">
      </path>
    </svg>
  );

  // const debouncedSearch = useMemo(() =>
  //   debounce(() => {
  //     // setSearchValue(value);
  //     fetchData();
  //   }, 400), []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchValue((e.target as HTMLInputElement).value);
    debouncedSearch((e.target as HTMLInputElement).value);
  }

  return (
    <Box className='geocoderContainer'>
      <IconButton className='iconButtonSearch' icon={SearchIcon} onClick={() => setIsOpen(!isOpen)} />
      {isOpen && (
        <TextField
          outlined
          // onChange={debouncedSearch}
          onChange={handleChange}
          placeholder={searchPlaceholder}
          value={searchValue}
        />
      )}

      {isOpen && (
        <Box
          className='geocoderForm'
        >
          <Box className='geocoderCheckboxContainer'>
            <Checkbox
              label={showFeatureOnMapLabel}
              icon={UncheckedIcon}
              checkedIcon={CheckedIcon}
              checked={showFeatureOnMap}
              onClick={() => {
                setShowFeatureOnMap(!showFeatureOnMap);
              }}
            />

            <Checkbox
              label={inMapExtentLabel}
              checked={isInMapExtent}
              icon={UncheckedIcon}
              checkedIcon={CheckedIcon}
              onClick={() => {
                setIsInMapExtent(!isInMapExtent);
              }}
            />
          </Box>

          {configs.map((config, index) => (
            <List>
              <Typography tag="span">
                {config.endPoint}
              </Typography>
              <Box className='resultsContainer'>
                {searchResults?.[index]?.resultObj?.features?.length ?
                  <>
                    {searchResults?.[index]?.resultObj?.features?.map((feature: any, i: number) => (
                      <>
                        <ListItem key={`feature-${i}`} onClick={() => {
                          mapViewer.camera.flyTo({
                            destination: CesiumRectangle.fromDegrees(...bbox(feature.geometry))
                          });

                          setFeatureToShow(feature);
                        }}>
                          <Box className='itemResult'>
                            {feature?.properties?.names?.default?.[0]}
                            {getIconByFeatureType()}
                          </Box>
                        </ListItem>
                      </>
                    ))}
                  </>
                  :
                  <ListItemSecondaryText>
                    {noResults}
                  </ListItemSecondaryText>
                }
              </Box>
            </List>
          ))}
        </Box>
      )}
    </Box>
  );
};