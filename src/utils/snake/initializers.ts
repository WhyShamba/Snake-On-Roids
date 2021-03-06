import { CellData, DIRECTION, FoodType } from '../../types/types';
import { generateRandomNum } from '../generateRandomNum';
import { Node, SingleLinkedList } from '../SingleLinkedList';

export const getInitialSnakeProperties = (
  board: number[][],
  isGuest: boolean,
  multiplayer: boolean = true
) => {
  const head = multiplayer
    ? new Node(getInitialSnakeCellMultiplayer(board, isGuest))
    : new Node(getInitialSnakeCell(board));

  return {
    snake: new SingleLinkedList(head),
    snakeCells: [head.data.value],
    direction: head.data.direction,
    consumption: {
      creatine: false,
      steroid: false,
    },
  };
};
// Now into consideration we have that the rows and column will have same number of rows/columns
export const getInitialSnakeCell = (board: number[][]): CellData => {
  const row = Math.floor(board.length / 2) - 1;
  const cell = Math.floor(board[row].length / 2) - 1;

  return {
    row,
    cell,
    value: board[row][cell],
    direction: generateRandomNum(0, 3),
  };
};

export const getInitialSnakeCellMultiplayer = (
  board: number[][],
  isGuest: boolean
): CellData => {
  const row = isGuest ? board.length - 1 : 0;
  const cell = isGuest ? board[row].length - 1 : 0;

  const direction = generateDirectionMultiplayer(isGuest);

  return {
    row,
    cell,
    value: board[row][cell],
    direction,
  };
};

export function generateDirectionMultiplayer(isGuest: boolean) {
  let direction;
  if (isGuest) {
    direction = Math.random() > 0.5 ? DIRECTION.LEFT : DIRECTION.UP;
  } else {
    direction = Math.random() > 0.5 ? DIRECTION.DOWN : DIRECTION.RIGHT;
  }
  return direction;
}

export function getFoodCell(board: number[][]) {
  let row = generateRandomNum(0, board.length - 1);
  let cell = generateRandomNum(0, board[0].length - 1);

  return board[row][cell];
}

export function getFoodType() {
  const randomNum = Math.random();
  // 50% to get meat if above 0.25 it's protein else meat
  let food: FoodType = randomNum > 0.25 ? 'protein' : 'meat';
  if (randomNum > 0.5 && randomNum < 0.8) {
    food = 'creatine';
  } else if (randomNum >= 0.8) {
    food = 'steroid';
  }
  return food;
}
