import React, { useMemo } from 'react';
import { get } from 'lodash';
import { CesiumInspector } from '../widget/cesium-inspector';
import { IWidgetProps, WidgetWrapper } from '../widget/widget-wrapper';
import { ActiveLayersPanel } from './active-layers-panel';

interface IDebugProps extends IWidgetProps {
  locale?: { [key: string]: string };
}

const ActiveLayersComponent: React.FC<IDebugProps> = ({ locale, isOpen, setIsOpen }) => {
  const title = useMemo(() => get(locale, 'ACTIVE_LAYERS_TITLE') ?? 'Active Layers', [locale]);

  return (
    <CesiumInspector title={title} isVisible={isOpen} onClick={() => setIsOpen(!isOpen)}>
      <ActiveLayersPanel locale={locale} />
    </CesiumInspector>
  );
};

export const ActiveLayersWidget = WidgetWrapper(ActiveLayersComponent);
