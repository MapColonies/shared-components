import React, { useEffect, useState } from 'react';

export const NO_BASEMAP_THUMBNAIL =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">' +
      '<rect width="32" height="32" rx="4" fill="#2c3037"/>' +
      '<circle cx="11" cy="10" r="3" fill="#5b6472"/>' +
      '<path d="M6 23 L12 14 L17 19 L22 11 L27 23 Z" fill="#5b6472"/>' +
      '</svg>'
  );

interface BaseMapThumbnailProps {
  className: string;
  src?: string;
  alt: string;
  title?: string;
  onClick?: () => void;
}

export const BaseMapThumbnail: React.FC<BaseMapThumbnailProps> = ({
  className,
  src,
  alt,
  title,
  onClick,
}) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const resolvedSrc = !src || failed ? NO_BASEMAP_THUMBNAIL : src;

  return (
    <img
      className={className}
      src={resolvedSrc}
      alt={alt}
      title={title}
      onClick={onClick}
      onError={() => setFailed(true)}
    />
  );
};
