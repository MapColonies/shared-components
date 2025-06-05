import { useEffect, useMemo, useRef, useState } from 'react';
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
import { IconButton, TextField, Typography, Checkbox, List, ListItem, ListItemSecondaryText, Tooltip } from '@map-colonies/react-core';
import { computeLimitedViewRectangle, defaultVisualizationHandler, rectangle2bbox } from '../helpers/utils';
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

export type CesiumGeocodingPropsPayload = UrlGroup & {
  method: Method,
  headers?: Record<string, string>,
  params: {
    dynamic: {
      queryText: string,
      geoContext?: string
    },
    static: Record<string, unknown>
  },
  title: string
}

export type GeocoderPanelProps = {
  configs: CesiumGeocodingPropsPayload[];
  locale?: { [key: string]: string };
}

export const GeocoderPanel: React.FC<GeocoderPanelProps> = ({ configs, locale }) => {
  const mapViewer = useCesiumMap();
  const dataSourceRef = useRef<GeoJsonDataSource | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isInMapExtent, setIsInMapExtent] = useState(false);
  const [showFeatureOnMap, setShowFeatureOnMap] = useState(false);
  const [responses, setSearchResults] = useState<{ resultObj: any; url: string; }[]>();
  const [featureToShow, setFeatureToShow] = useState();
  const showFeatureOnMapLabel = useMemo(() => get(locale, 'SHOW_FEATURE_ON_MAP') ?? 'Show feature on map', [locale]);
  const inMapExtentLabel = useMemo(() => get(locale, 'IN_MAP_EXTENT') ?? 'Search in map extent', [locale]);
  const searchPlaceholder = useMemo(() => get(locale, 'SEARCH_PLACEHOLDER') ?? 'Search...', [locale]);
  const noResults = useMemo(() => get(locale, 'NO_RESULTS') ?? 'No Results', [locale]);
  const isNotIn2DMode = useMemo(() => {
    if (mapViewer.scene.mode === SceneMode.SCENE2D) {
      return false;
    }

    setIsInMapExtent(false);
    return true;
  }, [mapViewer.scene.mode]);

  const DEFAULT_DEBOUNCE = 400;

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
    configs.forEach((config: CesiumGeocodingPropsPayload) => {
      if (config.baseUrl && config.endPoint && !config.url) {
        config.url = config.baseUrl + config.endPoint;
      }
    })
  }, [configs]);

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
    }
  }, [showFeatureOnMap, featureToShow])

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
        if (key === 'geo_context_mode' &&
          (!isInMapExtent || params.dynamic.geoContext === undefined || !url.includes(params.dynamic.geoContext))) {
          continue;
        }
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

  const getIconByFeatureType = (geometry: any) => {
    const geometryType = getType(geometry);
    let typedIcon;

    switch (geometryType) {
      case 'Polygon':
        typedIcon = '🟪';
        break;
      case 'Point':
        typedIcon = '🟢';
        break;
      case 'LineString':
        typedIcon = '📏';
        break;
      default:
        typedIcon = '❓';
        break;
    }

    return (
      <Tooltip content={geometryType}>
        <Box>
          {typedIcon}
        </Box>
      </Tooltip>
    )
  }

  return (
    <Box className='geocoderContainer'>
      <IconButton className='iconButtonSearch' icon={SearchIcon} onClick={() => setIsOpen(!isOpen)} />
      {isOpen && (
        <TextField
          outlined
          onChange={(e) => handleChange((e.target as HTMLInputElement).value, isInMapExtent)}
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
              disabled={isNotIn2DMode}
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
                {(() => {
                  const features = responses?.[index]?.resultObj?.features;
                  const featuresLength = responses?.[index]?.resultObj?.features?.length;
                  const message = responses?.[index]?.resultObj?.message;

                  if (featuresLength) {
                    return features.map((feature: any, i: number) => (
                      <ListItem key={`feature-${i}`} onClick={() => {
                        mapViewer.camera.flyTo({
                          destination: CesiumRectangle.fromDegrees(...bbox(feature.geometry))
                        });

                        setFeatureToShow(feature);
                      }}>
                        <Box className='itemResult'>
                          <>
                            <Tooltip content={feature?.properties?.names?.display}>
                              <Box>
                                {feature?.properties?.names?.default?.[0]}
                              </Box>
                            </Tooltip>
                            {getIconByFeatureType(feature)}
                          </>
                        </Box>
                      </ListItem>
                    ));
                  } else if (featuresLength === 0) {
                    return (
                      <ListItemSecondaryText className='itemResult'>
                        {noResults}
                      </ListItemSecondaryText>
                    );
                  } else if (message) {
                    return <Tooltip content={
                      <ListItemSecondaryText className='itemResult'>
                        {message}
                      </ListItemSecondaryText>
                    }>
                      <ListItemSecondaryText className='itemResult'>
                        {message}
                      </ListItemSecondaryText>
                    </Tooltip>
                  } else {
                    return (
                      <ListItemSecondaryText className='itemResult'>
                        {noResults}
                      </ListItemSecondaryText>
                    );
                  }
                })()}
              </Box>
            </List>
          ))}
        </Box>
      )}
    </Box>
  );
};