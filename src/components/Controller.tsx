import {
  ArrowBackIcon,
  ArrowDownIcon,
  ArrowForwardIcon,
  ArrowUpIcon,
} from '@chakra-ui/icons';
import { Box, Button } from '@chakra-ui/react';
import React from 'react';
import { DIRECTION } from '../App';

interface ControllerProps {
  changeDirection: (direction: DIRECTION) => any;
}

export const Controller: React.FC<ControllerProps> = ({ changeDirection }) => {
  return (
    <Box pos='absolute' right={14} bottom={14}>
      <Box
        pos='relative'
        bg='#2b6cb040'
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
        ].map((arrow, index) => (
          <Button
            key={arrow.direction}
            d='flex'
            justify='center'
            align='center'
            fontSize='4rem'
            pos='absolute'
            bg='#112233'
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
            _active={{
              border: '1px solid red',
            }}
            _focus={{
              border: '1px solid red',
            }}
            onClick={() => changeDirection(arrow.direction)}
          >
            {arrow.arrow}
          </Button>
        ))}
      </Box>
    </Box>
  );
};
