import { createContext, Dispatch, SetStateAction } from 'react';
import { MultiplayerSettingsType, SettingsType } from './App';
import { BOARD_SIZE, SNAKE_SPEED } from './consts';
import { createBoard } from './utils/createBoard';
import firebase from './firebase';
import { GamesCountType, HighScoreType } from './types/types';

export type ContextType = {
  user: firebase.User | null | undefined;
  userLoading: boolean;

  snakeSpeed: number;
  // Value will be LOW, MEDIUM OR HIGH
  setSnakeSpeed: (value: number) => any;

  board: number[][];
  boardSize: number;
  setBoardSize: (value: number) => any;

  musicVolume: number;
  setMusicVolume: (value: number) => any;

  disableController: boolean;
  toggleControllerHandler: () => any;

  mute: boolean;
  toggleMute: () => any;

  playGame: boolean;
  togglePlayGame: () => any;

  highestScore: {
    gameOne: number; // board size 10x10, speed LOW
    gameTwo: number; // board size 12x12, speed LOW
    gameThree: number; // board size 15x15, speed LOW
    gameFour: number; // board size 10x10, speed MEDIUM
    gameFive: number; // board size 12x12, speed MEDIUM
    gameSix: number; // board size 15x15, speed MEDIUM
    gameSeven: number; // board size 10x10, speed HIGH
    gameEight: number; // board size 12x12, speed HIGH
    gameNine: number; // board size 15x15, speed HIGH
  };
  setHighestScore: (highestScore: Partial<HighScoreType>) => any;
  gameType: GamesCountType;

  multiplayer: {
    snakeSpeed: number;
    // Value will be LOW, MEDIUM OR HIGH
    setSnakeSpeed: (value: number) => any;

    board: number[][];
    boardSize: number;
    setBoardSize: (value: number) => any;

    withTimer: boolean;
    gameDuration: number;
    toggleWithTimer: () => any;
    setGameDuration: (value: number) => any;

    betterPerf: boolean;
    toggleBetterPerf: Dispatch<SetStateAction<SettingsType>>;

    setMultiplayerBoardSettings: (
      settings: MultiplayerSettingsType['settings']
    ) => any;
  };
};

const initalCtxValues = {
  boardSize: BOARD_SIZE,
  setBoardSize: () => {},
  musicVolume: 1,
  setMusicVolume: () => {},
  snakeSpeed: SNAKE_SPEED,
  setSnakeSpeed: () => {},
  disableController: false,
  toggleControllerHandler: () => {},
  mute: false,
  toggleMute: () => {},
  playGame: false,
  togglePlayGame: () => {},
  board: createBoard(BOARD_SIZE),
  setHighestScore: () => {},
  user: null,
  userLoading: false,
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
  gameType: 'gameOne' as any,
};

export const MainContext = createContext<ContextType>({
  ...initalCtxValues,
  multiplayer: {
    ...initalCtxValues,
    betterPerf: true,
    toggleBetterPerf: () => {},
    gameDuration: 120,
    setGameDuration: () => {},
    board: createBoard(BOARD_SIZE),
    withTimer: false,
    toggleWithTimer: () => {},
    setMultiplayerBoardSettings: () => {},
  },
});
