import React, { useState } from 'react';
import { useEffect } from 'react';
import { imagesToPrecache } from '../../consts';
import { cacheImages } from '../../utils/cacheImages';
import { Text } from '@chakra-ui/react';

interface WaitForImagesProps {
  children: any;
}

export const WaitForImages: React.FC<WaitForImagesProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    cacheImages(imagesToPrecache).then(() => {
      setLoading(false);
    });
  }, []);
  if (loading) return <Text>Loading...</Text>;

  return children;
};
