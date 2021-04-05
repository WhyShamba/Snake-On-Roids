import { Box, BoxProps } from '@chakra-ui/layout';
import { Image, ImageProps } from '@chakra-ui/react';
import React from 'react';
import { DIRECTION } from '../../containers/Game';

interface HeadCellProps {
  direction: DIRECTION;
}

const createRotationStyle = (deg: number) => {
  return `rotate(${deg}deg)`;
};

export const HeadCell: React.FC<HeadCellProps> = ({ direction }) => {
  const style: BoxProps = {
    borderRightRadius: '2xl',
  };
  const imageStyle: ImageProps = {};
  switch (direction) {
    case DIRECTION.UP:
      style.transform = createRotationStyle(270);
      break;
    case DIRECTION.DOWN:
      style.transform = createRotationStyle(90);
      break;
    case DIRECTION.LEFT:
      style.transform = createRotationStyle(180);
      imageStyle.transform = 'rotate(180deg) scaleX(-1)';
      imageStyle.pos = 'absolute';
      imageStyle.bottom = 2;
      break;
    default:
      style.transform = createRotationStyle(0);
      break;
  }

  return (
    <Box w='100%' h='100%' bg='green.500' {...style} pos='relative'>
      {/* // TODO: Add hair */}
      <Image src='/snake/eyes.png' {...imageStyle} />
    </Box>
  );
};
