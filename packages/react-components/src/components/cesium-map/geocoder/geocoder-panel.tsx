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
  const [searchResults, setSearchResults] = useState<{ body: any; status: number; url: string }[]>();
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
    <svg width="16px" height="16px" viewBox="0 0 16 16">
      <rect x="0" y="0" width={16} height={16} rx="2" ry="2" fill="white" stroke="#ccc" strokeWidth={1} />
    </svg>
  );

  const CheckedIcon = (
    <svg width="16px" height="16px" viewBox="0 0 16 16">
      <rect x="0" y="0" width={16} height={16} rx="2" ry="2" fill="#1976d2" stroke="#1976d2" strokeWidth={1} />
      <path d="M4 8l2 2 6-6" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
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
        const body = await res.json();
        return {
          body,
          status: res.status,
          url: res.url,
        };
      })
    );
    if (jsonResponses) {
      const cleaned = jsonResponses.filter((item): item is { body: any; status: number; url: string } => item !== undefined);
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
          <svg width="18px" height="18px" viewBox="0 0 24 24" fill="var(--mdc-theme-cesium-color)">
            <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
          </svg>
        );
        break;
      case 'LineString':
        typedIcon = (
          <svg width="18px" height="18px" viewBox="0 0 24 24">
            <path fill="var(--mdc-theme-cesium-color)" stroke="var(--mdc-theme-cesium-color)" strokeWidth={0.5} d="M21 6h.046l-5.25 9h-.944L10 9.455V7H7v2.926L1.862 18H0v3h3v-2.926L8.138 10h1.01L14 15.545V18h3v-3h-.046l5.25-9H24V3h-3zM8 8h1v1H8zM2 20H1v-1h1zm14-3h-1v-1h1zm7-13v1h-1V4z" />
            <path fill="none" d="M0 0h24v24H0z" />
          </svg>
        );
        break;
      default:
        typedIcon = (
          <svg width="18px" height="18px" viewBox="0 0 24 24" fill="none" stroke="var(--mdc-theme-cesium-color)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4 L20 14 L20 20 L4 20 L4 10 Z" />
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
          className="cesium-geocoder-input"
          ref={geocoderInputRef}
          onChange={(e) => handleChange((e.target as HTMLInputElement).value, isInMapExtent)}
          placeholder={searchPlaceholder}
          value={searchValue}
          autoComplete="off"
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
                    const features = searchResults?.[index]?.body?.features;
                    const featuresLength: number | undefined = searchResults?.[index]?.body?.features?.length;
                    const message: string = searchResults?.[index]?.body?.message;
                    const status: number = searchResults?.[index]?.status as number;

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
                      return <ListItemSecondaryText className="generalListItem queryNoResults">{noResults}</ListItemSecondaryText>;
                    } else if (message) {
                      return <ListItemSecondaryText className={`generalListItem ${status === 400 ? 'queryWarning' : 'queryError'}`}>{message}</ListItemSecondaryText>;
                    } else {
                      return <ListItemSecondaryText className="generalListItem"></ListItemSecondaryText>;
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
