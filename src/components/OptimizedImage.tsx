'use client';

import { useState, CSSProperties } from 'react';
import Image, { StaticImageData } from 'next/image';
import { motion } from 'framer-motion';

interface OptimizedImageProps {
  src: string | StaticImageData;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  style?: CSSProperties;
}

const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 90,
  style
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoaded ? 1 : 0 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`${className} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoadingComplete={() => setIsLoaded(true)}
        placeholder="empty"
        priority={priority}
        quality={quality}
        loading={priority ? 'eager' : 'lazy'}
        sizes={`(max-width: 768px) 100vw, ${width}px`}
        style={style}
      />
      {!isLoaded && (
        <div 
          className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse"
          style={{ aspectRatio: `${width}/${height}` }}
        />
      )}
    </motion.div>
  );
};

export default OptimizedImage; 