import React, { useEffect, useState } from 'react';

interface ChangingProgressProviderProps {
  values: number[];
  interval?: number;
  children: (value: number) => React.ReactNode;
}

export const ChangingProgressProvider: React.FC<ChangingProgressProviderProps> = ({
  values,
  interval = 1000,
  children,
}) => {
  const [valuesIndex, setValuesIndex] = useState(0);

  useEffect(() => {
    const timerId = setInterval(() => {
      setValuesIndex((prevIndex) => (prevIndex + 1) % values.length);
    }, interval);

    return () => clearInterval(timerId);
  }, [values.length, interval]);

  return <>{children(values[valuesIndex])}</>;
};
