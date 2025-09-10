import React, { useEffect, useState } from 'react';
import { Animate } from 'react-move';

interface AnimatedValuesProviderProps {
  values?: number[];
  valueStart?: number;
  valueEnd?: number;
  duration?: number;
  interval?: number;
  easingFunction?: (t: number) => number;
  repeat?: boolean;
  children: (value: number) => React.ReactNode;
}

export const AnimatedValuesProvider: React.FC<AnimatedValuesProviderProps> = ({
  values,
  valueStart = 0,
  valueEnd,
  duration,
  interval = 1000,
  easingFunction,
  repeat,
  children,
}) => {
  const [valuesIndex, setValuesIndex] = useState(0);
  const [currentValue, setCurrentValue] = useState<number>(valueStart);
  const intervalRef = React.useRef<number | undefined>(undefined);
  const isAnimated = values === undefined && valueEnd !== undefined;

  useEffect(() => {
    if (isAnimated) {
      if (repeat) {
        intervalRef.current = window.setInterval(() => {
          setCurrentValue((prev) => (prev === valueStart ? valueEnd : valueStart));
        }, duration ? duration * 1000 : 1000);
      } else {
        setCurrentValue(valueEnd || valueStart);
      }

      return () => {
        window.clearInterval(intervalRef.current);
      };
    } else if (values) {
      intervalRef.current = window.setInterval(() => {
        setValuesIndex((prevIndex) => (prevIndex + 1) % values.length);
        setCurrentValue(values[valuesIndex]);
      }, interval);

      return () => clearInterval(intervalRef.current);
    }
  }, [values, valueEnd, duration, interval, repeat, valuesIndex]);

  return isAnimated ? (
    <Animate
      start={() => ({
        value: valueStart,
      })}
      update={() => ({
        value: [currentValue],
        timing: {
          duration: duration ? duration * 1000 : 1000,
          ease: easingFunction,
        },
      })}
    >
      {({ value }) => <>{children(value)}</>}
    </Animate>
  ) : (
    <>{children(currentValue)}</>
  );
};
