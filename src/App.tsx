import { Center, HStack, IconButton } from '@chakra-ui/react';
import React, { RefObject, useEffect, useRef, useState } from 'react';
import { BsBellFill, BsTrophy } from 'react-icons/bs';
import useSound from 'use-sound';
import { CoolBackground } from './components/CoolBackground/CoolBackground';
import { MainButtons } from './components/MainButtons';
import { BOARD_SIZE, SNAKE_SPEED } from './consts';
import Game from './containers/Game';
import { Menu } from './containers/Menu';
import { MainContext } from './context';

function App() {
  const [settings, setSettings] = useState(
    localStorage.getItem('sor:settings')
      ? JSON.parse(localStorage.getItem('sor:settings') || '')
      : {
          boardSize: BOARD_SIZE,
          snakeSpeed: SNAKE_SPEED,
          musicVolume: 1,
          disableController: false,
          mute: false,
        }
  );
  // Instead of adding react-router
  const [playGame, setPlayGame] = useState(false);
  const [play, { isPlaying, stop }] = useSound('/sound/Main.mp3', {
    volume: settings.musicVolume,
  });
  const [playBlopSound] = useSound('/sound/clicked.ogg', {
    volume: 0.1,
  });
  const playBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (playBtnRef.current && !settings.mute) {
      // Play sound on startup
      const timeout = setTimeout(() => {
        playBtnRef.current!.click();
      }, 1000);

      // Cleanup
      return () => {
        clearTimeout(timeout);
      };
    }
  }, []);

  useEffect(() => {
    const saveSettings = () => {
      localStorage.setItem('sor:settings', JSON.stringify(settings));
    };

    window.addEventListener('beforeunload', saveSettings);

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', saveSettings);
    };
  }, [settings]);

  const handleSound = () => {
    playBlopSound();
    if (isPlaying) {
      stop();
      setSettings({ ...settings, mute: true });
    } else {
      play();
      setSettings({ ...settings, mute: false });
    }
  };

  let component = <Menu onPlayGame={() => setPlayGame(true)} />;
  if (playGame) {
    // TODO: Add the new ctx things into the gameitself
    component = <Game />;
  }

  return (
    <Center minH='100vh' bg='primary.main' color='white' pos='relative'>
      <CoolBackground />
      <MainButtons
        btnRef={playBtnRef}
        handleSound={handleSound}
        isPlaying={isPlaying}
      />
      <MainContext.Provider
        value={{
          boardSize: settings.boardSize,
          musicVolume: settings.musicVolume,
          snakeSpeed: settings.snakeSpeed,
          disableController: settings.disableController,
          mute: settings.mute,
          setBoardSize: (boardSize) => setSettings({ ...settings, boardSize }),
          setMusicVolume: (musicVolume) =>
            setSettings({ ...settings, musicVolume }),
          setSnakeSpeed: (snakeSpeed) =>
            setSettings({ ...settings, snakeSpeed }),
          toggleControllerHandler: () =>
            setSettings({
              ...settings,
              disableController: !settings.disableController,
            }),
          toggleMute: () => setSettings({ ...settings, mute: !settings.mute }),
        }}
      >
        {component}
      </MainContext.Provider>
    </Center>
  );
}

export default App;
