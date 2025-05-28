import React, { useEffect } from 'react';
import { CesiumViewer, IDebugPanel, useCesiumMap } from '../map';
import { DebugPanelMixin } from './debug-panel-mixin';
import { isEmpty } from 'lodash';

export interface DebugPanelToolProps {
  debugPanel?: IDebugPanel;
  locale?: { [key: string]: string };
}

export const DebugPanelTool: React.FC<DebugPanelToolProps> = ({ debugPanel, locale }) => {
  const mapViewer: CesiumViewer = useCesiumMap();

  useEffect(() => {
    if (!isEmpty(debugPanel)) {
      mapViewer?.extend(DebugPanelMixin, {
        debugPanel: debugPanel,
        locale: locale,
      });
    }
  }, [mapViewer]);

  return null;
};
