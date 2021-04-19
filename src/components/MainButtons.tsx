import { HStack, IconButton } from '@chakra-ui/react';
import React from 'react';
import { BsTrophy } from 'react-icons/bs';
import { IoMdMusicalNotes } from 'react-icons/io';

interface MainButtonsProps {
  handleSound: any;
  btnRef: any;
  isPlaying: boolean;
  playGame: boolean;
  onLeaderboardOpen: any;
}

export const MainButtons: React.FC<MainButtonsProps> = ({
  isPlaying,
  btnRef,
  handleSound,
  playGame,
  onLeaderboardOpen,
}) => {
  return (
    <HStack
      pos='absolute'
      left={{ base: 'unset', lg: 6 }}
      bottom={{ base: 'unset', lg: 6 }}
      top={{ base: 2, lg: 'unset' }}
      right={{ base: 2, lg: 'unset' }}
      className={playGame ? 'main-buttons' : ''}
      zIndex={2}
    >
      <IconButton
        aria-label='leaderboard'
        icon={<IoMdMusicalNotes />}
        variant='ghost'
        size='lg'
        fontSize={{ lg: '45px', base: '38px' }}
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
        fontSize={{ lg: '40px', base: '33px' }}
        _focus={{}}
        _active={{}}
        _hover={{
          bg: 'none',
          transform: 'scale(1.05)',
        }}
        onClick={onLeaderboardOpen}
      />
    </HStack>
  );
};
