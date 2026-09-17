import React, { useEffect, useState } from 'react';
import { Box } from '../../box';

interface BaseMapThumbnailProps {
  className: string;
  src?: string;
  alt: string;
  title?: string;
  onClick?: () => void;
  fallbackColor: string;
}

export const BaseMapThumbnail: React.FC<BaseMapThumbnailProps> = ({
  className,
  src,
  alt,
  title,
  onClick,
  fallbackColor,
}) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <Box
        className={className}
        style={{ backgroundColor: fallbackColor, aspectRatio: '1 / 1' }}
        title={title}
        onClick={onClick}
        role="img"
        aria-label={alt}
      />
    );
  }

  return (
    <img
      className={className}
      src={src}
      alt={alt}
      title={title}
      onClick={onClick}
      onError={() => setFailed(true)}
    />
  );
};
