import { get } from 'lodash';
import React, { useMemo } from 'react';
import { Tooltip } from '@map-colonies/react-core';
import { Box } from '../../box';
import { ICesiumWFSLayerMeta } from '../layers/wfs.layer';
import { getDataLayerName, getLayerIdFromMeta } from '../layers-manager';

import './wfs.css';

interface IWFSProps {
  featureTypes: ICesiumWFSLayerMeta[];
  locale?: { [key: string]: string };
}

export const WFS: React.FC<IWFSProps> = ({ featureTypes, locale }) => {
  const title = useMemo(() => get(locale, 'WFS_TITLE') ?? 'Data Layers', [locale]);
  const cacheLabel = useMemo(() => get(locale, 'WFS_CACHE') ?? 'Cache', [locale]);
  const extentLabel = useMemo(() => get(locale, 'WFS_EXTENT') ?? 'Extent', [locale]);
  const noDataLayers = useMemo(() => get(locale, 'NO_DATA_LAYERS') ?? 'No DATA layers found', [locale]);

  const header = useMemo(() => {
    return <Box className="title">{title}</Box>;
  }, [title]);

  const content = useMemo(() => {
    return (
      <>
        {featureTypes.length > 0 ? (
          featureTypes.map((featureType, index) => (
            <Box key={index} className="featureType">
              {(() => {
                const dataLayerName = getDataLayerName(featureType) ?? '';
                const zoomLevel = featureType.zoomLevel ?? 0;
                return (
              <Tooltip
                content={`${dataLayerName} ${getLayerIdFromMeta(featureType)} (${zoomLevel})`}
              >
                <Box className={`name ${(featureType.currentZoomLevel ?? 0) < zoomLevel ? 'warning blinking' : featureType.total === -1 ? 'error blinking' : ''}`}>
                  {dataLayerName} ({zoomLevel}):
                </Box>
              </Tooltip>
                );
              })()}
              <Box className="info">
                <Box>
                  {cacheLabel}: {featureType.cache ?? 0}
                </Box>
                {(featureType.total ?? 0) > 0 && (
                  <Box className="spacer">
                    {extentLabel}: {featureType.items} / {featureType.total}
                  </Box>
                )}
              </Box>
            </Box>
          ))
        ) : (
          <Box className="noDataLayers">{noDataLayers}</Box>
        )}
      </>
    );
  }, [featureTypes]);

  return (
    <Box className="wfsContainer">
      {header}
      {content}
    </Box>
  );
};
