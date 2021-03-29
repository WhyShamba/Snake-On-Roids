import { Box, BoxProps } from '@chakra-ui/react';
import React from 'react';
import { DIRECTION } from '../../App';
import { createRotationStyle } from './TailCell';

interface StandardCellProps {
  direction?: DIRECTION;
  nextDirection?: DIRECTION;
  isTransitional?: boolean;
}

export const StandardCell: React.FC<StandardCellProps> = ({
  isTransitional,
  direction,
  nextDirection,
}) => {
  const style: BoxProps = {};

  if (isTransitional) {
    style.borderRightRadius = 'full';

    switch (direction) {
      case DIRECTION.UP:
        style.transform = createRotationStyle(270);

        // Instead of borderRadius i can add pictures
        if (nextDirection === DIRECTION.LEFT) {
          style.borderTopRightRadius = 'unset';
        } else if (nextDirection === DIRECTION.RIGHT) {
          style.borderBottomRightRadius = 'unset';
        }
        break;

      case DIRECTION.DOWN:
        style.transform = createRotationStyle(90);

        if (nextDirection === DIRECTION.LEFT) {
          style.borderBottomRightRadius = 'unset';
        } else if (nextDirection === DIRECTION.RIGHT) {
          style.borderTopRightRadius = 'unset';
        }
        break;
      case DIRECTION.LEFT:
        style.transform = createRotationStyle(180);

        if (nextDirection === DIRECTION.UP) {
          style.borderBottomRightRadius = 'unset';
        } else if (nextDirection === DIRECTION.DOWN) {
          style.borderTopRightRadius = 'unset';
        }
        break;
      default:
        //   case DIRECTION.RIGHT:
        style.transform = createRotationStyle(0);

        if (nextDirection === DIRECTION.UP) {
          style.borderTopRightRadius = 'unset';
        } else if (nextDirection === DIRECTION.DOWN) {
          style.borderBottomRightRadius = 'unset';
        }
        break;
    }
  }

  return <Box w='100%' h='100%' bg='green.500' {...style}></Box>;
};
