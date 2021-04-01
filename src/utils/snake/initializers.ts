import { CellData, FoodType } from '../../containers/Game';
import { generateRandomNum } from '../generateRandomNum';

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
