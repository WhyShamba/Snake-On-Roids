import { HStack, IconButton } from '@chakra-ui/react';
import React from 'react';
import { BsBellFill, BsTrophy } from 'react-icons/bs';

interface MainButtonsProps {
  handleSound: any;
  btnRef: any;
  isPlaying: boolean;
}

export const MainButtons: React.FC<MainButtonsProps> = ({
  isPlaying,
  btnRef,
  handleSound,
}) => {
  return (
    <HStack pos='absolute' left={6} bottom={6}>
      <IconButton
        aria-label='leaderboard'
        icon={<BsBellFill />}
        variant='ghost'
        size='lg'
        fontSize='37px'
        // disabled
        onClick={handleSound}
        ref={btnRef}
        _hover={{
          color: 'red',
          transform: 'scale(1.05) rotate(-5deg)',
        }}
        _focus={{}}
        _active={{}}
        color={isPlaying ? 'white' : 'red'}
      />
      <IconButton
        aria-label='leaderboard'
        icon={<BsTrophy />}
        variant='ghost'
        size='lg'
        fontSize='40px'
        disabled
        _hover={{
          bg: 'none',
          transform: 'scale(1.05)',
        }}
      />
    </HStack>
  );
};
