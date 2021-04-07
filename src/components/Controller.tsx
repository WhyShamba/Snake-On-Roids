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
  disable: boolean;
}

export const Controller: React.FC<ControllerProps> = React.memo(
  ({ changeDirection, currentDirection, disable }) => {
    if (disable) {
      return null;
    }

    return (
      <Box
        pos='absolute'
        right={{ lg: 14, base: 0 }}
        bottom={{ lg: 14, base: 12 }}
        left={{ lg: 'unset', base: 0 }}
        className='controller'
        zIndex={2}
      >
        <Box
          pos='relative'
          bg='primary.main'
          boxShadow='xl'
          border='1px solid white'
          borderColor='primary.borderColor'
          w={{ base: '150px', lg: '250px' }}
          h={{ base: '70px', lg: '120px' }}
          borderRadius='full'
          m='auto'
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
                fontSize={{ base: '9vw', lg: '4rem' }}
                pos='absolute'
                bg='primary.main'
                border='1px solid white'
                userSelect='none'
                cursor='pointer'
                borderRadius='full'
                w={{ base: '70px', lg: '100px' }}
                h={{ base: '70px', lg: '100px' }}
                margin='auto'
                _odd={{
                  left: index === 0 ? { lg: -12, base: -9 } : 'auto',
                  right: index === 2 ? { lg: -12, base: -9 } : 'auto',
                  bottom: 0,
                  top: 0,
                }}
                _even={{
                  top: index === 1 ? { lg: -12, base: -10 } : 'auto',
                  bottom: index === 3 ? { lg: -12, base: -10 } : 'auto',
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
                opacity='0.7'
                {...activeStyle}
              >
                {arrow.arrow}
              </Button>
            );
          })}
        </Box>
      </Box>
    );
  }
);
