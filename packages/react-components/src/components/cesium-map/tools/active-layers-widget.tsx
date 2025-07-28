import React, { useMemo, useState } from 'react';
import { get } from 'lodash';
import { CesiumInspector } from '../widget/cesium-inspector';
import { ActiveLayersPanel } from './active-layers-panel';

export interface IDebugProps {
  locale?: { [key: string]: string };
}

export const ActiveLayersWidget: React.FC<IDebugProps> = ({ locale }) => {
  const [isOpen, setIsOpen] = useState(false);
  const title = useMemo(() => get(locale, 'ACTIVE_LAYERS_TITLE') ?? 'Active Layers', [locale]);

  return (
    <>
      <CesiumInspector title={title} isVisible={isOpen} onClick={() => setIsOpen(!isOpen)}>
        <ActiveLayersPanel locale={locale} />
      </CesiumInspector>
    </>
  );
};
