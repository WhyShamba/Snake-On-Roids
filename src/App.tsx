import { Button, Center, useDisclosure } from '@chakra-ui/react';
import Peer from 'peerjs';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import useSound from 'use-sound';
import './App.css';
import { CoolBackground } from './components/CoolBackground/CoolBackground';
import { WaitForImages } from './components/hoc/WaitForImages';
import { LeaderboardModal } from './components/Leaderboard/LeaderboardModal';
import { MainButtons } from './components/MainButtons';
import { SafariAlert } from './components/SafariAlert';
import { UnsubmittedModal } from './components/UnsubmittedModal';
import { BOARD_SIZE, SNAKE_SPEED } from './consts';
import Game from './containers/Game';
import { Menu } from './containers/Menu';
import MultiplayerWrapper from './containers/Multiplayer/MultiplayerWrapper';
import { ContextType, MainContext } from './context';
import firebase from './firebase';
import { createBoard } from './utils/createBoard';
import { createValidUsername } from './utils/createValidUsername';
import { createLeaderboard } from './utils/firebase-operations/createLeaderboard';
import { updateLeaderboard } from './utils/firebase-operations/updateLeaderboard';
import { gameChooser } from './utils/gameChooser';
import { generateId } from './utils/generateId';
import { isSafari } from './utils/isSafari';
import { updateInitialHighScore } from './utils/updateInitialHighScore';
import { updateObj } from './utils/updateObj';
import { userExists } from './utils/userExists';

export type SettingsType = {
  boardSize: number;
  snakeSpeed: number;
  musicVolume: number;
  disableController: boolean;
  mute: boolean;
  highestScore: ContextType['highestScore'];
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
          highestScore: {
            gameOne: 0,
            gameTwo: 0,
            gameThree: 0,
            gameFour: 0,
            gameFive: 0,
            gameSix: 0,
            gameSeven: 0,
            gameEight: 0,
            gameNine: 0,
          },
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
  const {
    isOpen: leaderboardOpen,
    onOpen: onOpenLeaderboard,
    onClose: onCloseLeaderboard,
  } = useDisclosure();
  const [user, loading] = useAuthState(firebase.auth());
  // Modal showing only once when user visits website, if he has unsubmitted score
  const [unsubmittedModal, setUnsubmittedModal] = useState<JSX.Element>();

  /* eslint-disable */
  useEffect(() => {
    // TODO: TEST
    if (isSafari) setIsSafariBrowser(true);

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

  // useEffect for checking if right high score is set
  useEffect(() => {
    if (user) {
      const checkHighscore = async () => {
        const userDb = await userExists(user.displayName!);

        // if user registered previously in database
        const [toUpdate, isChanged] = updateInitialHighScore(
          settings.highestScore,
          userDb ? userDb.highScore : null
        );

        // update or create new leaderboard
        if (isChanged) {
          setUnsubmittedModal(
            <UnsubmittedModal
              toUpdate={toUpdate}
              displayName={user.displayName!}
            />
          );
          setSettings({
            ...settings,
            highestScore: { ...settings.highestScore, ...toUpdate },
          });
        }
        return;
      };

      checkHighscore();
    }
  }, [user]);

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

  const handleMultiplayer = useCallback((connectionPeerId?: string) => {
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
  }, []);

  let component = (
    <Menu
      onPlayGame={useCallback(() => setPlayGame(true), [])}
      handleMultiplayer={handleMultiplayer}
      openLeaderboard={useCallback(onOpenLeaderboard, [])}
      user={user}
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
      {unsubmittedModal}
      {isSafariBrowser && (
        <SafariAlert onClose={() => setIsSafariBrowser(false)} />
      )}
      <LeaderboardModal
        isOpen={leaderboardOpen}
        onClose={onCloseLeaderboard}
        currentUserId={
          user?.displayName ? createValidUsername(user?.displayName) : ''
        } // i set the displayName as an in
      />
      <Center minH='100vh' bg='primary.main' color='white' pos='relative'>
        <CoolBackground />
        <MainButtons
          btnRef={playBtnRef}
          handleSound={handleSound}
          isPlaying={isPlaying}
          playGame={playGame}
          onLeaderboardOpen={onOpenLeaderboard}
        />
        <MainContext.Provider
          value={{
            user,
            userLoading: loading,
            boardSize: settings.boardSize,
            musicVolume: settings.musicVolume,
            snakeSpeed: settings.snakeSpeed,
            disableController: settings.disableController,
            mute: settings.mute,
            playGame,
            board: createBoard(settings.boardSize),
            highestScore: settings.highestScore,
            gameType: gameChooser(settings.boardSize, settings.snakeSpeed),
            setHighestScore: (highestScore) =>
              setSettings({
                ...settings,
                highestScore: { ...settings.highestScore, ...highestScore },
              }),
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
