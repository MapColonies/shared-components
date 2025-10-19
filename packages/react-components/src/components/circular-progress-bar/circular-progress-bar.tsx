import React from 'react';
import {
  buildStyles,
  CircularProgressbar,
  CircularProgressbarWithChildren
} from 'react-circular-progressbar';

import 'react-circular-progressbar/dist/styles.css';

interface CircularProgressBarStylesProps {
  rotation?: number;
  strokeLinecap?: any;
  textColor?: string;
  textSize?: string | number;
  pathColor?: string;
  pathTransition?: string;
  pathTransitionDuration?: number;
  trailColor?: string;
  backgroundColor?: string;
}

interface CircularProgressBarProps {
  value: number;
  text?: string;
  children?: React.ReactNode;
  strokeWidth?: number;
  styles?: CircularProgressBarStylesProps;
  background?: boolean;
  backgroundPadding?: number;
  counterClockwise?: boolean;
  circleRatio?: number;
}

export const CircularProgressBar: React.FC<CircularProgressBarProps> = ({
  value,
  text,
  children,
  strokeWidth = 8,
  styles,
  background = false,
  backgroundPadding = 0,
  counterClockwise = false,
  circleRatio = 1,
}) => {
  const progressBarProps = {
    value,
    strokeWidth,
    background,
    backgroundPadding,
    counterClockwise,
    circleRatio,
    styles: buildStyles({
      ...styles,
    }),
  };

  if (children) {
    return (
      <CircularProgressbarWithChildren {...progressBarProps}>
        {children}
      </CircularProgressbarWithChildren>
    );
  }

  return (
    <CircularProgressbar
      {...progressBarProps}
      text={text}
    />
  );
};

export { buildStyles };
