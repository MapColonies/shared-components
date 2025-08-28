import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { debounce, get } from 'lodash';
import { GeoJsonDataSource, SceneMode } from 'cesium';
import bbox from '@turf/bbox';
import { getType } from '@turf/invariant';
import { TextField, Typography, Checkbox, List, ListItem, ListItemSecondaryText, Tooltip } from '@map-colonies/react-core';
import { Box } from '../../box';
import { useCesiumMap } from '../map';
import { applyFactor, customComputeViewRectangle, defaultVisualizationHandler, rectangle2bbox } from '../helpers/utils';
import { CesiumRectangle } from '../proxied.types';

import './geocoder-panel.css';
import '@map-colonies/react-core/dist/list/styles';
import '@map-colonies/react-core/dist/textfield/styles';

type Method = 'GET' | 'POST';

type UrlGroup = { baseUrl: string; endPoint: string; url?: string } | { baseUrl?: string; endPoint?: string; url: string };

type relatedParamsType = {
  name: string;
  relatedParams: [string, any][];
  titles?: Array<string | undefined>;
};

export type GeocoderOptions = UrlGroup & {
  title?: string;
  method: Method;
  headers?: Record<string, string>;
  params: {
    dynamic: {
      queryText: string | relatedParamsType;
      geoContext?: string | relatedParamsType;
    };
    static?: [string, any][];
  };
};

type GeocoderPanelProps = {
  options: GeocoderOptions[];
  isOpen: boolean;
  locale?: { [key: string]: string };
};

export const GeocoderPanel: React.FC<GeocoderPanelProps> = ({ options, isOpen, locale }) => {
  const mapViewer = useCesiumMap();
  const dataSourceRef = useRef<GeoJsonDataSource | undefined>(undefined);
  const geocoderInputRef = useRef<HTMLInputElement | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [isInMapExtent, setIsInMapExtent] = useState(false);
  const [showFeatureOnMap, setShowFeatureOnMap] = useState(true);
  const [responses, setSearchResults] = useState<{ resultObj: any; url: string }[]>();
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
      <rect x="0" y="0" width="16" height="16" rx="2" ry="2" fill="white" stroke="#ccc" strokeWidth="1" />
    </svg>
  );

  const CheckedIcon = (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <rect x="0" y="0" width="16" height="16" rx="2" ry="2" fill="#1976d2" stroke="#1976d2" strokeWidth="1" />
      <path d="M4 8l2 2 6-6" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  useEffect(() => {
    options.forEach((option: GeocoderOptions) => {
      if (option.baseUrl && option.endPoint && !option.url) {
        option.url = option.baseUrl + option.endPoint;
      }
    });
  }, [options]);

  useEffect(() => {
    if (isOpen && geocoderInputRef.current) {
      geocoderInputRef.current.focus();
    }
  }, [isOpen]);

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
  }, [mapViewer, showFeatureOnMap, featureToShow]);

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
    }
  };

  const addParamToUrl = (url: string, key: string, value: unknown): string => {
    const stringValue = valueToString(value);
    if (stringValue) {
      url += `&${key}=${encodeURIComponent(stringValue)}`;
    }

    return url;
  };

  const buildUrlParams = useCallback(
    (url: string, params: GeocoderOptions['params'], text: string, isInMapExtent: boolean) => {
      const dynamicParams = () => {
        const queryText = params.dynamic.queryText;
        const queryTextName = typeof queryText === 'string' ? queryText : queryText.name;
        const queryTextAdditionalParams = typeof queryText === 'string' ? undefined : queryText.relatedParams;

        url = addParamToUrl(url, queryTextName, text);

        if (queryTextAdditionalParams) {
          queryTextAdditionalParams.forEach((tuple) => {
            url = addParamToUrl(url, tuple[0], tuple[1]);
          });
        }

        if (isInMapExtent) {

          const rectangle = customComputeViewRectangle(mapViewer);

          const geoContext = params.dynamic.geoContext;
          const geoContextName = typeof geoContext === 'string' ? geoContext : geoContext?.name;

          if (rectangle && geoContextName) {
            const rectangle2bboxVal = rectangle2bbox(rectangle);
            const bbox = {
              bbox: [rectangle2bboxVal[0], rectangle2bboxVal[1], rectangle2bboxVal[2], rectangle2bboxVal[3]],
            };

            url = addParamToUrl(url, geoContextName, bbox);

            const geoContextAdditionalParams = typeof geoContext === 'string' ? undefined : geoContext?.relatedParams;

            if (geoContextAdditionalParams) {
              geoContextAdditionalParams.forEach((tuple) => {
                url = addParamToUrl(url, tuple[0], tuple[1]);
              });
            }
          }
        }
      };

      const staticParams = () => {
        params.static?.forEach((tuple) => {
          url = addParamToUrl(url, tuple[0], tuple[1]);
        });
      };

      url += '?';
      dynamicParams();
      staticParams();

      const questionMarkPosition = url.indexOf('?');
      url = url.slice(0, questionMarkPosition) + '?' + url.slice(questionMarkPosition + 2);

      return url;
    },
    [mapViewer]
  );

  const fetchData = useCallback(async (text: string, isInMapExtent: boolean) => {
    if (!text) {
      setSearchResults([]);
      return;
    }
    const queryPromises = options.map(async (option) => {
      if (option.url) {
        const url = buildUrlParams(option.url, option.params, text, isInMapExtent);
        return fetch(url, {
          method: 'GET',
        });
      } else {
        return Promise.reject({
          message: "Url doesn't exist, please provide",
        });
      }
    });
    const responses = await Promise.all(queryPromises);
    const jsonResponses = await Promise.all(
      responses.map(async (res) => {
        if (res === undefined) return;
        const resultObj = await res.json();
        return {
          resultObj,
          url: res.url,
        };
      })
    );
    if (jsonResponses) {
      const cleaned = jsonResponses.filter((item): item is { resultObj: any; url: string } => item !== undefined);
      setSearchResults(cleaned);
    }
  }, [buildUrlParams, options]);

  const debouncedSearch = useMemo(() =>
    debounce((value: string, isInMapExtent: boolean) => {
      fetchData(value, isInMapExtent);
    }, DEFAULT_DEBOUNCE), [fetchData]);

  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);

  const handleChange = (value: string, isInMapExtent: boolean) => {
    setSearchValue(value);
    debouncedSearch(value, isInMapExtent);
  };

  useEffect(() => {
    fetchData(searchValue, isInMapExtent);
  }, [isInMapExtent]);

  const getIconByFeatureType = (geometry: any) => {
    const geometryType = getType(geometry);
    let typedIcon;
    switch (geometryType) {
      case 'Point':
        typedIcon = (
          <svg className={`geometrysSvgIcons`} width="30px" height="18px" viewBox="0 0 24 24">
            <path d="M5 14.2864C3.14864 15.1031 2 16.2412 2 17.5C2 19.9853 6.47715 22 12 22C17.5228 22 22 19.9853 22 17.5C22 16.2412 20.8514 15.1031 19 14.2864M18 8C18 12.0637 13.5 14 12 17C10.5 14 6 12.0637 6 8C6 4.68629 8.68629 2 12 2C15.3137 2 18 4.68629 18 8ZM13 8C13 8.55228 12.5523 9 12 9C11.4477 9 11 8.55228 11 8C11 7.44772 11.4477 7 12 7C12.5523 7 13 7.44772 13 8Z" />
          </svg>
        );
        break;
      case 'LineString':
        typedIcon = (
          <svg className={`geometrysSvgIcons`} width="30px" height="25px" viewBox="0 0 24 24">
            <path d="M3 16.5L9 10L13 16L21 6.5" />
          </svg>
        );
        break;
      default:
        typedIcon = (
          <svg className={`geometrysSvgIcons`} width="30px" height="20px" viewBox="0 0 24 24" fill="none" stroke="var(--mdc-theme-cesium-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2 L26 12 L24 20 L6 20 L4 8 Z" />
          </svg>
        );
        break;
    }
    return <Box>{typedIcon}</Box>;
  };

  return (
    <Box className="geocoderContainer">
      <Box className="geocoderForm">
        <TextField
          id="geocoderTextField"
          className="cesium-geocoder-input geocoderInput"
          ref={geocoderInputRef}
          onChange={(e) => handleChange((e.target as HTMLInputElement).value, isInMapExtent)}
          placeholder={searchPlaceholder}
          value={searchValue}
        />
        <Box className="search-results">
          <Box className="checkboxesContainer">
            <Checkbox
              className="checkboxElement"
              label={showFeatureOnMapLabel}
              icon={UncheckedIcon}
              checkedIcon={CheckedIcon}
              checked={showFeatureOnMap}
              onClick={() => {
                setShowFeatureOnMap(!showFeatureOnMap);
              }}
            />
            <Checkbox
              className="checkboxElement"
              label={
                <Typography tag="span" className={isNotIn2DMode ? 'disabled' : ''}>
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

          <Box className="listsContainer">
            {options.map((option, index) => (
              <List>
                <Typography className="bold" tag="span">
                  {option.title ?? option.endPoint}
                </Typography>
                <Box className="listContainer">
                  {(() => {
                    const features = responses?.[index]?.resultObj?.features;
                    const featuresLength: number | undefined = responses?.[index]?.resultObj?.features?.length;
                    const message: string = responses?.[index]?.resultObj?.message;

                    const noResultsJSX = <ListItemSecondaryText className="generalListItem queryNoResults">{noResults}</ListItemSecondaryText>;

                    if (featuresLength) {
                      return features.map((feature: any, i: number) => (
                        <ListItem
                          key={`feature-${i}`}
                          className={featureToShow === feature ? 'mdc-ripple-upgraded--background-focused' : ''}
                          onClick={() => {
                            mapViewer.camera.flyTo({
                              destination: applyFactor(CesiumRectangle.fromDegrees(...bbox(feature.geometry))),
                            });

                            setFeatureToShow(feature);
                          }}
                        >
                          <Box className="queryItemResult">
                            <Tooltip content={feature?.properties?.names?.display}>
                              <Box>{feature?.properties?.names?.default?.[0]}</Box>
                            </Tooltip>
                            {getIconByFeatureType(feature)}
                          </Box>
                        </ListItem>
                      ));
                    } else if (featuresLength === 0) {
                      return noResultsJSX;
                    } else if (message) {
                      return <ListItemSecondaryText className="generalListItem queryServiceError">{message}</ListItemSecondaryText>;
                    } else {
                      return noResultsJSX;
                    }
                  })()}
                </Box>
              </List>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
