import React, { useEffect, useRef, useState } from 'react';
import { WebMercatorProjection, ScreenSpaceEventType } from 'cesium';
import { CesiumViewer, useCesiumMap } from '../map';

import './coordinates-tracker.tool.css';
import { Proj, COORDINATES_WGS_FRACTION_DIGITS, COORDINATES_MERCATOR_FRACTION_DIGITS } from '../../utils/projections';
import { pointToLonLat } from './geojson/point.geojson';
import { CesiumCartographic } from '../proxied.types';

export interface RCoordinatesTrackerToolProps {
  projection?: Proj;
}

export const CoordinatesTrackerTool: React.FC<RCoordinatesTrackerToolProps> = (props) => {
  const mapViewer: CesiumViewer = useCesiumMap();
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    mapViewer.screenSpaceEventHandler.setInputAction((evt?: Record<string, unknown>) => {
      if (evt?.endPosition) {
        const pos = { ...(evt.endPosition as { x: number; y: number }) } as {
          x: number;
          y: number;
        };

        // Cesium's event adds some decimal numbers to the screen position.
        pos.x = Math.ceil(pos.x);
        pos.y = Math.ceil(pos.y);
        
        setPosition(pos);
      }
    }, ScreenSpaceEventType.MOUSE_MOVE);
  }, [ref, mapViewer]);

  useEffect(() => {
    const ellipsoid = mapViewer.scene.globe.ellipsoid;
    // Mouse over the globe to see the cartographic position

    if (position) {
      const screenPositionDegrees = pointToLonLat(mapViewer, position.x, position.y);
      if(screenPositionDegrees) {
      const cartographic = new CesiumCartographic(screenPositionDegrees.longitude, screenPositionDegrees.latitude);
        if (ref.current) {
          let coordinatesText = '';
          switch (props.projection) {
            case Proj.WEB_MERCATOR: {
              const wmProjection = new WebMercatorProjection(ellipsoid);
              const res = wmProjection.project(cartographic);
              coordinatesText = `Mercator: ${res.y.toFixed(COORDINATES_MERCATOR_FRACTION_DIGITS)}m, ${res.x.toFixed(
                COORDINATES_MERCATOR_FRACTION_DIGITS
              )}m`;
              ref.current.style.width = '220px';
              break;
            }
            case Proj.WGS84: {
              const longitudeString = cartographic.longitude.toFixed(COORDINATES_WGS_FRACTION_DIGITS);
              
              const latitudeString = cartographic.latitude.toFixed(COORDINATES_WGS_FRACTION_DIGITS);
  
              coordinatesText = `WGS84: ${latitudeString}°N ${longitudeString}°E`;
              ref.current.style.width = '200px';
              break;
            }
            default:
              break;
          }
          ref.current.innerHTML = coordinatesText;
        }
      }
    }
  }, [position, ref, mapViewer, props.projection]);

  return <div className="trackerPosition" ref={ref}></div>;
};
