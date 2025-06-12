import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useCesiumMap } from '../map';
import {
  Cartesian2,
  Cartesian3,
  Cartographic,
  defined,
  GeoJsonDataSource,
  Ray,
  Rectangle,
  SceneMode,
  Viewer,

} from 'cesium';
import { IconButton, TextField, Typography, Checkbox, List, ListItem, ListItemSecondaryText, Tooltip, ThemeProvider } from '@map-colonies/react-core';
import { applyFactor, computeLimitedViewRectangle, defaultVisualizationHandler, rectangle2bbox } from '../helpers/utils';
import { debounce, get } from 'lodash';
import bbox from '@turf/bbox';
import { getType } from '@turf/invariant';
import { CesiumRectangle } from '../proxied.types';
import { Box } from '../../box';

import './geocoder-panel.css';
import '@map-colonies/react-core/dist/list/styles';


export type Method = 'GET' | 'POST';

type UrlGroup =
  | { baseUrl: string; endPoint: string; url?: string }
  | { baseUrl?: string; endPoint?: string; url: string }

type relatedParamsType = {
  name: string,
  relatedParams: [string, any][]
}

export type CesiumGeocodingPropsPayload = UrlGroup & {
  title?: string,
  geometryIconClassName?: string,
  method: Method,
  headers?: Record<string, string>,
  params: {
    dynamic: {
      queryText: string | relatedParamsType,
      geoContext?: string | relatedParamsType,
    },
    static?: [string, any][],
  },
}

export type GeocoderPanelProps = {
  configs: CesiumGeocodingPropsPayload[];
  locale?: { [key: string]: string };
}

export const GeocoderPanel: React.FC<GeocoderPanelProps> = ({ configs, locale }) => {
  const mapViewer = useCesiumMap();
  const dataSourceRef = useRef<GeoJsonDataSource | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const geocoderPanelRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isInMapExtent, setIsInMapExtent] = useState(false);
  const [showFeatureOnMap, setShowFeatureOnMap] = useState(false);
  const [responses, setSearchResults] = useState<{ resultObj: any; url: string; }[]>();
  const [featureToShow, setFeatureToShow] = useState();
  const showFeatureOnMapLabel = useMemo(() => get(locale, 'SHOW_FEATURE_ON_MAP') ?? 'Show on map', [locale]);
  const inMapExtentLabel = useMemo(() => get(locale, 'IN_MAP_EXTENT') ?? 'Search in extent', [locale]);
  const searchPlaceholder = useMemo(() => get(locale, 'SEARCH_PLACEHOLDER') ?? 'Search...', [locale]);
  const noResults = useMemo(() => get(locale, 'NO_RESULTS') ?? 'No Results', [locale]);
  const isNotIn2DMode = useMemo(() => {
    if (mapViewer.scene.mode === SceneMode.SCENE2D) {
      return false;
    }

    setIsInMapExtent(false);
    return true;
  }, [mapViewer.scene.mode]);

  const DEFAULT_DEBOUNCE = 300;

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      const target = event.target;
      const geocoderDlgRef = get(geocoderPanelRef, 'current');
      if (geocoderDlgRef && !geocoderDlgRef.contains(target as Node)) {
        document.removeEventListener('click', handleClickOutside, false);
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside, false);

    return (): void => {
      document.removeEventListener('click', handleClickOutside, false);
    };
  });

  useEffect(() => {
    configs.forEach((config: CesiumGeocodingPropsPayload) => {
      if (config.baseUrl && config.endPoint && !config.url) {
        config.url = config.baseUrl + config.endPoint;
      }
    })
  }, [configs]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen])

  useEffect(() => {
    if (!mapViewer) return;

    if (!dataSourceRef.current) {
      const dataSource = new GeoJsonDataSource('geocoderDataSource');
      dataSourceRef.current = dataSource;
      mapViewer.dataSources.add(dataSource);
    }

    const dataSource = dataSourceRef.current;

    if (featureToShow && showFeatureOnMap) {
      const drawFeature = async () => {
        const newGeoJson = {
          type: 'FeatureCollection',
          features: [featureToShow],
        };

        await dataSource.load(newGeoJson);

        defaultVisualizationHandler(mapViewer, dataSource, [], '#01FF1F');
      };

      drawFeature();
    } else {
      dataSource.entities.removeAll();
    }
  }, [mapViewer, showFeatureOnMap, featureToShow])

  const addParamToUrl = (url: string, key: string, value: unknown): string => {
    const stringValue = valueToString(value);
    if (stringValue) {
      url += `&${key}=${encodeURIComponent(stringValue)}`;
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

  const buildUrlParams = (url: string, params: CesiumGeocodingPropsPayload['params'], text: string, isInMapExtent: boolean) => {
    const dynamicParams = () => {
      const queryText = params.dynamic.queryText;
      const queryTextName = typeof queryText === 'string' ? queryText : queryText.name;
      const queryTextAdditionalParams = typeof queryText === 'string' ? undefined : queryText.relatedParams;

      url = addParamToUrl(url, queryTextName, text);

      if (queryTextAdditionalParams) {
        queryTextAdditionalParams.forEach((tuple) => {
          url = addParamToUrl(url, tuple[0], tuple[1]);
        })
      }

      if (isInMapExtent) {
        // const rectangle = getAccurateViewRectangle(mapViewer);

        const rectangle = computeLimitedViewRectangle(mapViewer);

        const geoContext = params.dynamic.geoContext;
        const geoContextName = typeof geoContext === 'string' ? geoContext : geoContext?.name;

        if (rectangle && geoContextName) {
          const rectangle2bboxVal = rectangle2bbox(rectangle);
          const bbox = {
            bbox: [
              rectangle2bboxVal[0],
              rectangle2bboxVal[1],
              rectangle2bboxVal[2],
              rectangle2bboxVal[3]
            ]
          };

          url = addParamToUrl(url, geoContextName, bbox);

          const geoContextAdditionalParams = typeof geoContext === 'string' ? undefined : geoContext?.relatedParams;

          if (geoContextAdditionalParams) {
            geoContextAdditionalParams.forEach((tuple) => {
              url = addParamToUrl(url, tuple[0], tuple[1]);
            })
          }
        }
      }
    }

    const staticParams = () => {
      params.static?.forEach((tuple) => {
        url = addParamToUrl(url, tuple[0], tuple[1]);
      })
    }

    url += '?';
    dynamicParams();
    staticParams();

    const questionMarkPosition = url.indexOf('?');
    url = url.slice(0, questionMarkPosition) + '?' + url.slice(questionMarkPosition + 2);

    return url;
  }

  const debouncedSearch = useMemo(() => debounce((value: string, isInMapExtent: boolean) => {
    fetchData(value, isInMapExtent);
  }, DEFAULT_DEBOUNCE), []);

  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);

  const fetchData = async (text: string, isInMapExtent: boolean) => {
    if (!text) {
      setSearchResults([]);
      return;
    }

    const queryPromises = configs.map(async (config) => {
      if (config.url) {
        const url = buildUrlParams(config.url, config.params, text, isInMapExtent);
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

  const handleChange = (value: string, isInMapExtent: boolean) => {
    setSearchValue(value);
    debouncedSearch(value, isInMapExtent);
  }

  useEffect(() => {
    fetchData(searchValue, isInMapExtent);
  }, [isInMapExtent])

  const getIconByFeatureType = (geometry: any, className?: string) => {
    const geometryType = getType(geometry);
    let typedIcon;

    switch (geometryType) {
      case 'Point':
        typedIcon =
          <svg className={`geometrysSvgIcons ${className}`} width="50px" height="20px" viewBox="0 0 24 24">
            <path d="M5 14.2864C3.14864 15.1031 2 16.2412 2 17.5C2 19.9853 6.47715 22 12 22C17.5228 22 22 19.9853 22 17.5C22 16.2412 20.8514 15.1031 19 14.2864M18 8C18 12.0637 13.5 14 12 17C10.5 14 6 12.0637 6 8C6 4.68629 8.68629 2 12 2C15.3137 2 18 4.68629 18 8ZM13 8C13 8.55228 12.5523 9 12 9C11.4477 9 11 8.55228 11 8C11 7.44772 11.4477 7 12 7C12.5523 7 13 7.44772 13 8Z" />
          </svg>;
        break;
      case 'LineString':
        typedIcon =
          <svg className={`geometrysSvgIcons ${className}`} width="50px" height="25px" viewBox="0 0 24 24">
            <path d="M3 16.5L9 10L13 16L21 6.5" />
          </svg>;
        break;
      default:
        typedIcon =
          <svg className={`geometrysSvgIcons ${className}`} width="50px" height="20px" viewBox="0 0 24 24">
            <path d="M20.9485 11.0195C21.2909 11.6283 21.2909 12.3717 20.9485 12.9805L17.5735 18.9805C17.2192 19.6103 16.5529 20 15.8303 20H8.16969C7.44715 20 6.78078 19.6103 6.42654 18.9805L3.05154 12.9805C2.70908 12.3717 2.70908 11.6283 3.05154 11.0195L6.42654 5.01948C6.78078 4.38972 7.44715 4 8.16969 4H15.8303C16.5529 4 17.2192 4.38972 17.5735 5.01948L20.9485 11.0195Z" />
          </svg>;
        break;
    }

    return (
      <Box>
        {typedIcon}
      </Box>
    )
  }

  return (
    <ThemeProvider options={{ primary: '#007bff' }}>
      <div ref={geocoderPanelRef} className='geocoderContainer'>
        <IconButton className='cesium-geocoder-searchButton' icon={SearchIcon} onClick={() => setIsOpen(prev => !prev)} />

        {isOpen && (
          <Box className='geocoderForm'>
            <TextField
              className='cesium-geocoder-input'
              ref={inputRef}
              outlined
              onChange={(e) => handleChange((e.target as HTMLInputElement).value, isInMapExtent)}
              placeholder={searchPlaceholder}
              value={searchValue}
            />
            <Box
              className='search-results'
            >
              <Box>
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
                  label={
                    <Typography
                      tag='span'
                      className={isNotIn2DMode ? 'disabledInMapExtent' : ''}>
                      {inMapExtentLabel}
                    </Typography>
                  }
                  checked={isInMapExtent}
                  icon={UncheckedIcon}
                  checkedIcon={CheckedIcon}
                  disabled={isNotIn2DMode}
                  onClick={() => {
                    setIsInMapExtent(!isInMapExtent);
                  }}
                />
              </Box>

              {configs.map((config, index) => (
                <List>
                  <Typography tag="span">
                    {config.title ?? config.endPoint}
                  </Typography>
                  <Box className='resultsContainer'>
                    {(() => {
                      const features = responses?.[index]?.resultObj?.features;
                      const featuresLength: number | undefined = responses?.[index]?.resultObj?.features?.length;
                      const message: string = responses?.[index]?.resultObj?.message;

                      const noResultsJSX = (
                        <ListItemSecondaryText className='itemResult noResults'>
                          {noResults}
                        </ListItemSecondaryText>
                      )

                      if (featuresLength) {
                        return features.map((feature: any, i: number) => (
                          <ListItem key={`feature-${i}`} className={featureToShow === feature ? 'mdc-ripple-upgraded--background-focused' : ''} onClick={() => {
                            mapViewer.camera.flyTo({
                              destination: applyFactor(CesiumRectangle.fromDegrees(...bbox(feature.geometry)))
                            });

                            setFeatureToShow(feature);
                          }}>
                            <Box className='itemResult'>
                              <Tooltip content={feature?.properties?.names?.display}>
                                <Box>
                                  {feature?.properties?.names?.default?.[0]}
                                </Box>
                              </Tooltip>
                              {getIconByFeatureType(feature, config.geometryIconClassName)}
                            </Box>
                          </ListItem>
                        ));
                      } else if (featuresLength === 0) {
                        return (
                          noResultsJSX
                        );
                      } else if (message) {
                        return (
                          <ListItemSecondaryText className="query-service-error">
                            {message}
                          </ListItemSecondaryText>
                        );
                      } else {
                        return (
                          noResultsJSX
                        );
                      }
                    })()}
                  </Box>
                </List>
              ))}
            </Box>
          </Box>
        )}
      </div>
    </ThemeProvider>
  );
};