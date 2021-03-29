import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import { Box, Center, Flex, Heading, Text } from '@chakra-ui/layout';
import { Node, SingleLinkedList } from './utils/SingleLinkedList';
import { Controller } from './components/Controller';
import { generateRandomNum } from './utils/generateRandomNum';
import { useSetInterval } from './custom-hooks/useSetInterval';
import { Button } from '@chakra-ui/button';
import { useDisclosure } from '@chakra-ui/react';
import { GameOverModal } from './components/GameOverModal';
import {
  getFoodCell,
  getFoodType,
  getInitialSnakeCell,
} from './utils/snake/initializers';
import {
  changeDirection,
  getNextNodeForDirection,
  getOppositeDirection,
} from './utils/snake/snake-coordination';
import { HeadCell } from './components/Cells/HeadCell';
import { StandardCell } from './components/Cells/StandardCell';
import { FoodCell } from './components/Cells/FoodCell';
import { TailCell } from './components/Cells/TailCell';
import { useSnakeMovement } from './custom-hooks/useSnakeMovement';

export type FoodType = 'protein' | 'meat' | 'steroid' | 'creatine';
export type CellData = {
  row: number;
  cell: number;
  value: number;
  direction: DIRECTION;
};

// values are 0, 1, 2, 3
export enum DIRECTION {
  LEFT,
  UP,
  RIGHT,
  DOWN,
}

let BOARD_SIZE = 10 * 10;
const createBoard = (boardSize = BOARD_SIZE) => {
  if (boardSize !== BOARD_SIZE) BOARD_SIZE = boardSize;

  // Get the number of rows/cells
  const rowsAndCells = Math.sqrt(boardSize);

  const board = [];
  let cellNumber = 0;
  for (let index = 0; index < rowsAndCells; index++) {
    board.push(
      new Array(rowsAndCells).fill(null).map(() => {
        cellNumber += 1;
        return cellNumber;
      })
    );
  }

  return board;
};

const SNAKE_SPEED = 250;
const SNAKE_SPEED_ON_ROIDS = SNAKE_SPEED * 1.75;
const SNAKE_SPEED_ON_CREATINE = SNAKE_SPEED * 1.5;

function App() {
  const [board, setBoard] = useState(createBoard());
  const snakeRef = useRef(
    new SingleLinkedList(new Node(getInitialSnakeCell(board)))
  );
  const [snakeCells, setSnakeCells] = useState(
    new Set([snakeRef.current.head?.data?.value || 1])
  );
  const { direction, setDirection, snakeCellsSizeRef } = useSnakeMovement(
    snakeRef.current.head!.data!.direction
  );
  const [score, setScore] = useState(0);
  const [foodCell, setFoodCell] = useState({
    value: getFoodCell(board),
    food: getFoodType(),
  });
  const {
    isOpen: gameOver,
    onOpen: openModal,
    onClose: closeModal,
  } = useDisclosure();
  useSetInterval(() => {
    if (!gameOver) moveSnake();
  }, SNAKE_SPEED * 2);

  const snake = snakeRef.current;

  const isOutOfBounds = () => {
    switch (direction) {
      case DIRECTION.RIGHT:
        if (snake.head!.data!.cell + 1 === board[0].length) {
          // setGameOver(true);
          openModal();
          return true;
        }
        break;
      case DIRECTION.LEFT:
        if (snake.head!.data!.cell - 1 < 0) {
          // setGameOver(true);
          openModal();
          return true;
        }
        break;
      case DIRECTION.UP:
        if (snake.head!.data!.row - 1 < 0) {
          // setGameOver(true);
          openModal();
          return true;
        }
        break;
      default:
        // case DIRECTION.DOWN
        if (snake.head!.data!.row + 1 === board[0].length) {
          // setGameOver(true);
          openModal();
          return true;
        }
        break;
    }
    return false;
  };

  const moveSnake = () => {
    if (!isOutOfBounds()) {
      const newNode = getNextNodeForDirection(snake.head!, direction, board);

      // If it's not colliding
      if (!snakeCells.has(newNode.data!.value)) {
        const newSnakeCells = changeDirection(newNode, snake, snakeCells);

        const foodConsumed = newNode.data!.value === foodCell.value;
        if (foodConsumed) {
          consumeFood(newSnakeCells);
        }

        snakeCellsSizeRef.current = newSnakeCells.size;

        setSnakeCells(newSnakeCells);
      } else {
        openModal();
      }
    }
  };

  const generateFoodCell = () => {
    // TODO: WRITE ALGORITHAM THAT REMOVES THE VALUES WHERE THE SNAKE IS FROM THE BOARD IT SELF, BECAUSE IF SNAKE GETS TOO BIG IT WILL BE IMPOSSIBLE, LAG TO GENERATE RANDDOM NUM, SINCE THE SNAKE WILL COVER EVERYTHING
    // Generate food cell at random position
    let value = getFoodCell(board);

    while (snakeCells.has(value) || value === foodCell.value) {
      value = getFoodCell(board);
    }

    let food: FoodType = getFoodType();

    setFoodCell({
      food,
      value,
    });
  };

  // Grow the snake and do the effect
  const consumeFood = (newSnakeCells: Set<number>) => {
    const oppositeDirOfTail = getOppositeDirection(snake.tail!.data!.direction);
    const newTailNode = getNextNodeForDirection(
      snake.tail!,
      oppositeDirOfTail,
      board
    );

    // After creation of new node make sure the direction is set to the appropriate directiont
    newTailNode.data!.direction = snake.tail!.data!.direction;
    // Insertion at beginning of tail, dequeue -> add it to class
    const temp = snake.tail;
    snake.tail = newTailNode;
    snake.tail.next = temp;

    newSnakeCells.add(newTailNode.data!.value);

    setScore(score + 1);
    // generate new food cell
    generateFoodCell();
  };

  // Reset the game to initial state
  const playAgain = () => {
    snakeRef.current = new SingleLinkedList(
      new Node(getInitialSnakeCell(board))
    );

    // setSnakeCells(new Set([snake.head!.data!.value]));
    setSnakeCells(new Set([snakeRef.current.head!.data!.value]));
    setFoodCell({
      value: getFoodCell(board),
      food: getFoodType(),
    });

    setDirection(generateRandomNum(0, 3));
    setScore(0);

    closeModal();
  };

  return (
    <Center minH='100vh' bg='blue.900' color='white'>
      <Flex direction='column' align='center'>
        {/* Or image logo */}
        <Heading>Snake On Roids</Heading>
        <Text>Score: {score}</Text>
        <Box outline='2px solid white' outlineColor='blue.200'>
          {board.map((row, index) => (
            <Flex key={index}>
              {row.map((cell) => {
                // Let this be standard cell
                let cellType: any = null;
                if (cell === snakeRef.current.head!.data!.value) {
                  cellType = (
                    <HeadCell direction={snake.head!.data!.direction} />
                  );
                } else if (cell === foodCell.value ? 'violet' : undefined) {
                  cellType = <FoodCell food={foodCell.food} />;
                } else if (
                  snake.tail?.data?.value === cell &&
                  snake.tail.data.value !== snake.head?.data?.value
                ) {
                  const snakeTailDirection = snake.tail!.data!.direction;
                  const snakeTailNextDirection =
                    snake.tail?.next?.data?.direction;

                  cellType = (
                    <TailCell
                      direction={snakeTailDirection}
                      nextDirection={snakeTailNextDirection}
                      // If it will change direction in the next step
                      isTransitional={
                        snakeTailDirection !== snakeTailNextDirection
                      }
                    />
                  );
                } else if (snakeCells.has(cell)) {
                  const match = snake.find((node) => node.data?.value === cell);

                  const currentDirection = match?.currentNode.data?.direction;
                  const nextDirection = match?.nextNode?.data?.direction;

                  cellType = (
                    <StandardCell
                      direction={currentDirection}
                      nextDirection={nextDirection}
                      isTransitional={currentDirection !== nextDirection}
                    />
                  );
                }

                return (
                  <Box
                    w='50px'
                    h='50px'
                    outline='1px solid white'
                    outlineColor='blue.200'
                    key={cell}
                  >
                    {cellType}
                  </Box>
                );
              })}
            </Flex>
          ))}
        </Box>
        <Controller
          changeDirection={(_direction: DIRECTION) => setDirection(_direction)}
          currentDirection={direction}
        />
      </Flex>
      <GameOverModal
        isOpen={gameOver}
        onClose={closeModal}
        score={score}
        onPlayAgain={playAgain}
      />
    </Center>
  );
}

export default App;
