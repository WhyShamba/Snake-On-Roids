import {
  ArrowBackIcon,
  ArrowDownIcon,
  ArrowForwardIcon,
  ArrowUpIcon,
} from '@chakra-ui/icons';
import { Box, Button, ButtonProps } from '@chakra-ui/react';
import React from 'react';
import { DIRECTION } from '../containers/Game';

interface ControllerProps {
  changeDirection: (direction: DIRECTION) => any;
  currentDirection: DIRECTION;
}

export const Controller: React.FC<ControllerProps> = ({
  changeDirection,
  currentDirection,
}) => {
  return (
    <Box pos='absolute' right={14} bottom={14}>
      <Box
        pos='relative'
        bg='primary.main'
        boxShadow='xl'
        border='1px solid white'
        borderColor='primary.borderColor'
        w='250px'
        h='120px'
        borderRadius='full'
      >
        {[
          {
            direction: DIRECTION.LEFT,
            arrow: <ArrowBackIcon />,
          },
          {
            direction: DIRECTION.UP,
            arrow: <ArrowUpIcon />,
          },
          {
            direction: DIRECTION.RIGHT,
            arrow: <ArrowForwardIcon />,
          },
          {
            direction: DIRECTION.DOWN,
            arrow: <ArrowDownIcon />,
          },
        ].map((arrow, index) => {
          const activeStyle: ButtonProps = {};
          if (arrow.direction === currentDirection) {
            activeStyle.border = '1px solid red';
            activeStyle.transform = 'scale(1.05)';
          }
          return (
            <Button
              key={arrow.direction}
              d='flex'
              justify='center'
              align='center'
              fontSize='4rem'
              pos='absolute'
              bg='primary.main'
              border='1px solid white'
              userSelect='none'
              cursor='pointer'
              borderRadius='full'
              w='100px'
              h='100px'
              margin='auto'
              _odd={{
                left: index === 0 ? -12 : 'auto',
                right: index === 2 ? -12 : 'auto',
                bottom: 0,
                top: 0,
              }}
              _even={{
                top: index === 1 ? -12 : 'auto',
                bottom: index === 3 ? -12 : 'auto',
                left: 0,
                right: 0,
              }}
              transition='all 0.2s'
              _hover={{
                transform: 'scale(1.05)',
              }}
              _focus={{}}
              _active={{}}
              onClick={() => changeDirection(arrow.direction)}
              {...activeStyle}
            >
              {arrow.arrow}
            </Button>
          );
        })}
      </Box>
    </Box>
  );
};
