import { get } from 'lodash';
import React, { useMemo } from 'react';
import { Tooltip } from '@map-colonies/react-core';
import { Box } from '../../box';
import { IActiveFeatureTypes } from './debug';

import './wfs.css';

interface IWFSProps {
  featureTypes: IActiveFeatureTypes[];
  locale?: { [key: string]: string };
}

export const WFS: React.FC<IWFSProps> = ({ featureTypes, locale }) => {
  const title = useMemo(() => get(locale, 'WFS_TITLE') ?? 'Data Layers', [locale]);
  const cacheLabel = useMemo(() => get(locale, 'WFS_CACHE') ?? 'Cache', [locale]);
  const extentLabel = useMemo(() => get(locale, 'WFS_EXTENT') ?? 'Extent', [locale]);
  const noDataLayers = useMemo(() => get(locale, 'NO_DATA_LAYERS') ?? 'No layers found', [locale]);

  const header = useMemo(() => {
    return <Box className="title">{title}</Box>;
  }, [title]);

  const content = useMemo(() => {
    return (
      <>
        {featureTypes.length > 0 ? (
          featureTypes.map((type, index) => (
            <Box key={index} className="featureType">
              <Tooltip content={`${type.featureStructure.aliasLayerName as string} ${type.id} (${String(type.zoomLevel)})`}>
                <Box className={`name ${type.currentZoomLevel < type.zoomLevel ? 'warning blinking' : type.total === -1 ? 'error blinking' : ''}`}>
                  {type.featureStructure.aliasLayerName as string} ({String(type.zoomLevel)}):
                </Box>
              </Tooltip>
              <Box className="info">
                <Box>
                  {cacheLabel}: {type.cache ?? 0}
                </Box>
                {type.total > 0 && (
                  <Box className="spacer">
                    {extentLabel}: {type.items} / {type.total}
                  </Box>
                )}
              </Box>
            </Box>
          ))
        ) : (
          <Box>{noDataLayers}</Box>
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
