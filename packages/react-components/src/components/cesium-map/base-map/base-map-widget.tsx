import React, { useMemo, useState } from 'react';
import { get } from 'lodash';
import { IBaseMaps } from '../map';
import { CesiumIcon } from '../widget/cesium-icon';
import { CesiumTool } from '../widget/cesium-tool';
import { CesiumBaseMaps } from './base-maps';

interface IBaseMapWidgetProps {
  baseMaps?: IBaseMaps;
  locale?: { [key: string]: string };
}

export const BaseMapWidget: React.FC<IBaseMapWidgetProps> = ({ baseMaps, locale }) => {
  const [isOpen, setIsOpen] = useState(false);
  const title = useMemo(() => get(locale, 'BASE_MAP_TITLE') ?? 'Base Map', [locale]);

  return (
    <>
      <CesiumIcon onClick={() => setIsOpen(!isOpen)}>
        <img className="cesium-baseLayerPicker-selected" src="assets/img/1st.png" title="1st Map" />
      </CesiumIcon>
      <CesiumTool isVisible={isOpen} title={title}>
        <CesiumBaseMaps baseMaps={baseMaps}></CesiumBaseMaps>
      </CesiumTool>
    </>
  );
};
