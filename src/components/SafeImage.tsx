'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';

type SafeImageProps = Omit<ImageProps, 'src'> & {
  src?: string | null;
  fallbackSrc?: string;
};

const DEFAULT_FALLBACK = '/images/hero.png';

const isPollinationsUrl = (value: string) =>
  value.startsWith('https://image.pollinations.ai/');

export default function SafeImage({
  src,
  fallbackSrc = DEFAULT_FALLBACK,
  alt,
  ...props
}: SafeImageProps) {
  const initialSrc = (src && src.trim().length > 0 && !isPollinationsUrl(src)) ? src : fallbackSrc;
  const [currentSrc, setCurrentSrc] = useState(initialSrc);

  const handleError = () => {
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    }
  };

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      onError={handleError}
    />
  );
}
