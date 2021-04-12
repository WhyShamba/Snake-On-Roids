import {
  DIRECTION,
  SnakeType,
} from '/home/bazhe/Desktop/projects/snake-on-roids/src/types/types';

export function isOutOfBounds(
  direction: DIRECTION,
  snake: SnakeType,
  board: number[][]
) {
  switch (direction) {
    case DIRECTION.RIGHT:
      if (snake.head!.data!.cell + 1 === board[0].length) {
        return true;
      }
      break;
    case DIRECTION.LEFT:
      if (snake.head!.data!.cell - 1 < 0) {
        return true;
      }
      break;
    case DIRECTION.UP:
      if (snake.head!.data!.row - 1 < 0) {
        return true;
      }
      break;
    default:
      // case DIRECTION.DOWN
      if (snake.head!.data!.row + 1 === board[0].length) {
        return true;
      }
      break;
  }
  return false;
}
