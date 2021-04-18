import {
  BOARD_SIZE,
  BOARD_SIZE_MEDIUM,
  SNAKE_SPEED,
  SNAKE_SPEED_MEDIUM,
} from '../consts';
import { GamesCountType } from '../types/types';

/**
 * @description Why gameOne, gameTwo etc..? Because game  has 9 mods and if for every game if it's saved boardSize and snakeSpeed, it will take more space in the db => instead of 9 fields, it will be 9x3(one for score, boardSize and snakeSpeed)
    gameOne - board size 10x10, speed LOW
    gameTwo - board size 12x12, speed LOW
    gameThree - board size 15x15, speed LOW
    gameFour - board size 10x10, speed MEDIUM
    gameFive - board size 12x12, speed MEDIUM
    gameSix - board size 15x15, speed MEDIUM
    gameSeven - board size 10x10, speed HIGH
    gameEight - board size 12x12, speed HIGH
    gameNine; - board size 15x15, speed HIGH
 */
export const gameChooser = (
  boardSize: number,
  snakeSpeed: number
): GamesCountType => {
  switch (snakeSpeed) {
    case SNAKE_SPEED:
      switch (boardSize) {
        case BOARD_SIZE:
          return 'gameOne';
        case BOARD_SIZE_MEDIUM:
          return 'gameTwo';
        default:
          // case BOARD_SIZE_HIGH:
          return 'gameThree';
      }
    case SNAKE_SPEED_MEDIUM:
      switch (boardSize) {
        case BOARD_SIZE:
          return 'gameFour';
        case BOARD_SIZE_MEDIUM:
          return 'gameFive';
        default:
          // case BOARD_SIZE_HIGH:
          return 'gameSix';
      }
    default:
      // case SNAKE_SPEED_HIGH:
      switch (boardSize) {
        case BOARD_SIZE:
          return 'gameSeven';
        case BOARD_SIZE_MEDIUM:
          return 'gameEight';
        default:
          // case BOARD_SIZE_HIGH:
          return 'gameNine';
      }
  }
};
