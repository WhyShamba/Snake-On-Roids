import { Center } from '@chakra-ui/react';
import Peer from 'peerjs';
import React, { useEffect, useRef, useState } from 'react';
import useSound from 'use-sound';
import './App.css';
import { CoolBackground } from './components/CoolBackground/CoolBackground';
import { WaitForImages } from './components/hoc/WaitForImages';
import { MainButtons } from './components/MainButtons';
import { SafariAlert } from './components/SafariAlert';
import { BOARD_SIZE, SNAKE_SPEED } from './consts';
import Game from './containers/Game';
import { Menu } from './containers/Menu';
import MultiplayerWrapper from './containers/Multiplayer/MultiplayerWrapper';
import { MainContext } from './context';
import { createBoard } from './utils/createBoard';
import { generateId } from './utils/generateId';
import { isSafari } from './utils/isSafari';
import { updateObj } from './utils/updateObj';

export type SettingsType = {
  boardSize: number;
  snakeSpeed: number;
  musicVolume: number;
  disableController: boolean;
  mute: boolean;
};

export type MultiplayerSettingsType = {
  peer?: Peer;
  peerId?: string;
  connectionPeerId?: string;
  settings: {
    betterPerf: boolean;
    withTimer: boolean;
    gameDuration: number;
    boardSize: number;
    board: number[][];
    snakeSpeed: number;
  };
};

function App() {
  const [isSafariBrowser, setIsSafariBrowser] = useState(false);
  const [settings, setSettings] = useState<SettingsType>(
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
  const [
    multiplayerSettings,
    setMultiplayerSettings,
  ] = useState<MultiplayerSettingsType>({
    settings: {
      boardSize: BOARD_SIZE,
      snakeSpeed: SNAKE_SPEED,
      betterPerf: true,
      withTimer: false,
      gameDuration: 120,
      board: createBoard(BOARD_SIZE),
    },
  });

  /* eslint-disable */
  useEffect(() => {
    // TODO: test, if not working add detect-browser library
    if (isSafari()) setIsSafariBrowser(true);

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

  const setMultiplayerBoardSettings = (
    _settings: MultiplayerSettingsType['settings']
  ) =>
    setMultiplayerSettings({
      ...multiplayerSettings,
      settings: _settings,
    });

  const handleMultiplayer = (connectionPeerId?: string) => {
    const peer = new Peer(generateId());

    peer.on('open', function (id) {
      setMultiplayerSettings({
        ...multiplayerSettings!,
        peer,
        peerId: id,
        // This field determines whenever the user creates or joins a game
        connectionPeerId:
          typeof connectionPeerId === 'string' ? connectionPeerId : undefined,
      });
    });
  };

  let component = (
    <Menu
      onPlayGame={() => setPlayGame(true)}
      handleMultiplayer={handleMultiplayer}
    />
  );

  if (playGame) {
    component = (
      <WaitForImages>
        <Game />
      </WaitForImages>
    );
  } else if (multiplayerSettings?.peer) {
    component = (
      <MultiplayerWrapper
        {...multiplayerSettings}
        cancelGame={() =>
          setMultiplayerSettings({
            ...multiplayerSettings,
            peer: undefined,
            peerId: undefined,
          })
        }
        boardSettings={multiplayerSettings.settings}
        setMultiplayerBoardSettings={setMultiplayerBoardSettings}
      />
    );
  }

  return (
    <>
      {isSafariBrowser && (
        <SafariAlert onClose={() => setIsSafariBrowser(false)} />
      )}
      <Center minH='100vh' bg='primary.main' color='white' pos='relative'>
        <CoolBackground />
        <MainButtons
          btnRef={playBtnRef}
          handleSound={handleSound}
          isPlaying={isPlaying}
          playGame={playGame}
        />
        <MainContext.Provider
          value={{
            boardSize: settings.boardSize,
            musicVolume: settings.musicVolume,
            snakeSpeed: settings.snakeSpeed,
            disableController: settings.disableController,
            mute: settings.mute,
            playGame,
            board: createBoard(settings.boardSize),
            setBoardSize: (boardSize) =>
              setSettings({ ...settings, boardSize }),
            setMusicVolume: (musicVolume) =>
              setSettings({ ...settings, musicVolume }),
            setSnakeSpeed: (snakeSpeed) =>
              setSettings({ ...settings, snakeSpeed }),
            toggleControllerHandler: () =>
              setSettings({
                ...settings,
                disableController: !settings.disableController,
              }),
            toggleMute: () =>
              setSettings({ ...settings, mute: !settings.mute }),
            togglePlayGame: () => setPlayGame(!playGame),
            multiplayer: {
              boardSize: multiplayerSettings.settings.boardSize,
              snakeSpeed: multiplayerSettings.settings.snakeSpeed,
              betterPerf: multiplayerSettings.settings.betterPerf,
              gameDuration: multiplayerSettings.settings.gameDuration,
              withTimer: multiplayerSettings.settings.withTimer,
              board: multiplayerSettings.settings.board,
              setMultiplayerBoardSettings,
              setBoardSize: (boardSize) =>
                setMultiplayerSettings(
                  updateObj(multiplayerSettings, {
                    settings: {
                      ...multiplayerSettings.settings,
                      boardSize,
                      board: createBoard(boardSize),
                    },
                  })
                ),
              setSnakeSpeed: (snakeSpeed) =>
                setMultiplayerSettings(
                  updateObj(multiplayerSettings, {
                    settings: {
                      ...multiplayerSettings?.settings,
                      snakeSpeed,
                    },
                  })
                ),
              toggleBetterPerf: () =>
                setMultiplayerSettings({
                  ...multiplayerSettings,
                  settings: {
                    ...multiplayerSettings.settings,
                    betterPerf: !multiplayerSettings.settings.betterPerf,
                  },
                }),
              toggleWithTimer: () =>
                setMultiplayerSettings(
                  updateObj(multiplayerSettings, {
                    settings: {
                      ...multiplayerSettings.settings,
                      withTimer: !multiplayerSettings.settings.withTimer,
                    },
                  })
                ),
              setGameDuration: (gameDuration) =>
                setMultiplayerSettings(
                  updateObj(multiplayerSettings, {
                    settings: {
                      ...multiplayerSettings?.settings,
                      gameDuration,
                    },
                  })
                ),
            },
          }}
        >
          {component}
        </MainContext.Provider>
      </Center>
    </>
  );
}

export default App;
