import { Box, BoxProps } from '@chakra-ui/layout';
import React from 'react';
import { DIRECTION } from '../../App';

interface TailCellProps {
  direction: DIRECTION;
  nextDirection?: DIRECTION;
  isTransitional: boolean;
}

export const createRotationStyle = (deg: number) => {
  return `rotate(${deg}deg)`;
};

export const TailCell: React.FC<TailCellProps> = ({
  direction,
  nextDirection,
  isTransitional,
}) => {
  const style: BoxProps = {
    borderLeftRadius: 'full',
  };

  let directionForStyle = direction;
  if (isTransitional && nextDirection !== undefined) {
    console.log('Using next direction');
    directionForStyle = nextDirection;
  }

  switch (directionForStyle) {
    case DIRECTION.UP:
      style.transform = createRotationStyle(270);
      break;
    case DIRECTION.DOWN:
      style.transform = createRotationStyle(90);
      break;
    case DIRECTION.LEFT:
      style.transform = createRotationStyle(180);
      break;
    default:
      style.transform = createRotationStyle(0);
      break;
  }

  //   Logic for transitonal cells
  //   if (isTransitional) {
  //     if (direction === DIRECTION.UP && nextDirection === DIRECTION.LEFT) {
  //       style.borderTopLeftRadius = 'unset';
  //     } else if (
  //       direction === DIRECTION.UP &&
  //       nextDirection === DIRECTION.RIGHT
  //     ) {
  //       style.borderBottomLeftRadius = 'unset';
  //     }
  //   }

  return (
    <Box w='100%' h='100%' bg='green.500' {...style}>
      tail
    </Box>
  );
};
