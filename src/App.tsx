import { Center, HStack, IconButton } from '@chakra-ui/react';
import React, { useState } from 'react';
import { BsBellFill, BsTrophy } from 'react-icons/bs';
import { CoolBackground } from './components/CoolBackground/CoolBackground';
import Game from './containers/Game';
import { Menu } from './containers/Menu';

function App() {
  // Instead of adding react-router
  const [playGame, setPlayGame] = useState(false);

  let component = <Menu onPlayGame={() => setPlayGame(true)} />;
  let bgComponent: any = <CoolBackground />;
  if (playGame) {
    component = <Game />;
    // bgComponent = null;
  }

  return (
    <Center minH='100vh' bg='primary.main' color='white' pos='relative'>
      {bgComponent}
      {/* // TODO: create buttons component */}
      <HStack pos='absolute' left={6} bottom={6}>
        <IconButton
          aria-label='leaderboard'
          icon={<BsBellFill />}
          variant='ghost'
          size='lg'
          fontSize='37px'
          disabled
          _hover={{
            bg: 'none',
            transform: 'scale(1.05)',
          }}
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
      {component}
    </Center>
  );
}

export default App;
