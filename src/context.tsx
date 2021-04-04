import { createContext } from 'react';
import { BOARD_SIZE, SNAKE_SPEED } from './consts';
import { createBoard } from './utils/createBoard';

export type ContextType = {
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
};

export const MainContext = createContext<ContextType>({
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
});
