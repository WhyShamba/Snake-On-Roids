import { FoodCell, FoodType, SnakeType } from '../../types/types';
import { getFoodCell, getFoodType } from './initializers';
import {
  getOppositeDirection,
  getNextNodeForDirection,
} from './snake-coordination';

export function growSnake(
  snake: SnakeType,
  board: number[][],
  snakeCells: number[]
) {
  const oppositeDirOfTail = getOppositeDirection(snake.tail!.data!.direction);
  const newTailNode = getNextNodeForDirection(
    snake.tail!,
    oppositeDirOfTail,
    board
  );

  // After creation of new node make sure the direction is set to the appropriate directiont
  newTailNode.data!.direction = snake.tail!.data!.direction;

  // Insertion at beginning of tail
  const temp = snake.tail;
  snake.tail = newTailNode;
  snake.tail.next = temp;

  return [...snakeCells, newTailNode.data!.value];
}

export function reverseSnake(snake: SnakeType) {
  snake.reverse((reversedNode) => {
    // Algorithm for determining which node is transitional and adding the right direction to it. Check the SingleLinkedList test case for detailed explanation
    const nextNodeDirection = reversedNode.next?.data?.direction;
    const currentNodeDirection = reversedNode.data!.direction;
    const isTransitional = currentNodeDirection !== nextNodeDirection;

    if (isTransitional && nextNodeDirection !== undefined) {
      reversedNode.data!.direction = getOppositeDirection(nextNodeDirection);
    } else {
      reversedNode.data!.direction = getOppositeDirection(currentNodeDirection);
    }
  });
}

// food generator
export const generateFoodCell = (
  foodCell: FoodCell,
  board: number[][],
  snakeCells: number[]
) => {
  // TODO: WRITE ALGORITHAM THAT REMOVES THE VALUES WHERE THE SNAKE IS FROM THE BOARD IT SELF, BECAUSE IF SNAKE GETS TOO BIG IT WILL BE IMPOSSIBLE, LAG TO GENERATE RANDDOM NUM, SINCE THE SNAKE WILL COVER EVERYTHING
  // Generate food cell at random position
  let value = getFoodCell(board);

  while (snakeCells.includes(value) || value === foodCell.value) {
    value = getFoodCell(board);
  }

  let food: FoodType = getFoodType();

  return {
    food,
    value,
  };
};

// Mutable way of editing because im using immerjs
export function removeCells(
  snakeCells: number[],
  snake: SnakeType,
  howMany: number
) {
  let newSnakeCells = [...snakeCells];

  const removeCellsNumber =
    newSnakeCells.length - howMany > 1 ? newSnakeCells.length - howMany : 1;
  while (newSnakeCells.length !== removeCellsNumber) {
    const removedTail = snake.deque();
    newSnakeCells = newSnakeCells.filter(
      (cellVal) => cellVal !== removedTail!.data!.value
    );
  }
  return newSnakeCells;
}
