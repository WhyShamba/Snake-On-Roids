import { HStack, IconButton } from '@chakra-ui/react';
import React from 'react';
import { BsBellFill, BsTrophy } from 'react-icons/bs';

interface MainButtonsProps {
  handleSound: any;
  btnRef: any;
  isPlaying: boolean;
  playGame: boolean;
}

export const MainButtons: React.FC<MainButtonsProps> = ({
  isPlaying,
  btnRef,
  handleSound,
  playGame,
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
        icon={<BsBellFill />}
        variant='ghost'
        size='lg'
        fontSize={{ lg: '37px', base: '29px' }}
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
        disabled
        _hover={{
          bg: 'none',
          transform: 'scale(1.05)',
        }}
      />
    </HStack>
  );
};
