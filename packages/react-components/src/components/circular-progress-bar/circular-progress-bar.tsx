import React from 'react';
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';

import 'react-circular-progressbar/dist/styles.css';

interface CircularProgressBarProps {
  value: number;
  text?: string;
  strokeWidth?: number;
  styles?: any;
  background?: boolean;
  backgroundPadding?: number;
  counterClockwise?: boolean;
  circleRatio?: number;
}

export const CircularProgressBar: React.FC<CircularProgressBarProps> = ({
  value,
  text,
  strokeWidth = 8,
  styles,
  background = false,
  backgroundPadding = 0,
  counterClockwise = false,
  circleRatio = 1,
}) => {
  return (
    <CircularProgressbar
      value={value}
      text={text}
      strokeWidth={strokeWidth}
      background={background}
      backgroundPadding={backgroundPadding}
      counterClockwise={counterClockwise}
      circleRatio={circleRatio}
      styles={buildStyles({
        pathColor: `rgba(62, 152, 199, ${value / 100})`,
        textColor: '#F88',
        trailColor: '#D6D6D6',
        ...styles,
      })}
    />
  );
};

export { buildStyles };
