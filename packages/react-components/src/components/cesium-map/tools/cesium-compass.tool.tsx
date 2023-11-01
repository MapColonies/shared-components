// @ts-ignore - viewerCesiumNavigationMixin has no typings.
import viewerCesiumNavigationMixin from '@cmcleese/cesium-navigation';
import { useCesiumMap } from '../map';

import '@cmcleese/cesium-navigation/dist/index.css';
import './cesium-compass.tool.css';

import { useEffect } from 'react';

interface CesiumCompassToolProps {
  enableCompass?: boolean;
  enableZoomControls?: boolean;
  lockCompassNavigation?: boolean;
  locale?: { [key: string]: string };
}

const CesiumCompassTool: React.FC<CesiumCompassToolProps> = (props) => {  
  const mapViewer = useCesiumMap();

  const {enableCompass = true, enableZoomControls = false, lockCompassNavigation = false, locale = {DIRECTION: 'ltr'}} = props;

  useEffect(() => {
    mapViewer.extend(viewerCesiumNavigationMixin, {
      enableCompass,
      enableZoomControls,
      enableDistanceLegend: false
    });
    
    // @ts-ignore
    mapViewer.cesiumNavigation.setNavigationLocked(lockCompassNavigation);

    const compassElem = document.querySelector('.compass');
    console.log(compassElem);
    if(compassElem && locale.DIRECTION) {
      compassElem.classList.add(locale.DIRECTION);
    }
  }, [mapViewer]);


  return null;
};

export default CesiumCompassTool;