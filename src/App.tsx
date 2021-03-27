import React, { useEffect, useRef, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { Box, Center, Flex, Heading, Text } from '@chakra-ui/layout';
import { Node, SingleLinkedList } from './utils/SingleLinkedList';
import { Controller } from './components/Controller';
import { generateRandomNum } from './utils/generateRandomNum';
import { useSetInterval } from './custom-hooks/useSetInterval';
import { Button } from '@chakra-ui/button';
import { useDisclosure } from '@chakra-ui/react';
import { GameOverModal } from './components/GameOverModal';

type FoodType = 'protein' | 'meat' | 'steroid' | 'creatine';
type CellData = {
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

// Now into consideration we have that the rows and column will have same number of rows/columns
const getInitialSnakeCell = (board: number[][]): CellData => {
  const row = Math.floor(board.length / 2) - 1;
  const cell = Math.floor(board[row].length / 2) - 1;

  return {
    row,
    cell,
    value: board[row][cell],
    direction: generateRandomNum(0, 3),
  };
};

function App() {
  const [board, setBoard] = useState(createBoard());
  const snakeRef = useRef(
    new SingleLinkedList(new Node(getInitialSnakeCell(board)))
  );
  const [snakeCells, setSnakeCells] = useState(
    new Set([snakeRef.current.head?.data?.value || 1])
  );
  const [direction, setDirection] = useState<DIRECTION>(
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

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // TODO: dont allow opposite key to be clicked
      const key = e.key.toLocaleLowerCase();
      if (key === 'a' || key === 'arrowleft') {
        setDirection(DIRECTION.LEFT);
      } else if (key === 'w' || key === 'arrowup') {
        setDirection(DIRECTION.UP);
      } else if (key === 's' || key === 'arrowdown') {
        setDirection(DIRECTION.DOWN);
      } else if (key === 'd' || key === 'arrowright') {
        setDirection(DIRECTION.RIGHT);
      }
    };

    window.addEventListener('keydown', onKeyDown, true);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

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

    while (snakeCells.has(value) && value === foodCell.value) {
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
              {row.map((cell) => (
                <Box
                  w='50px'
                  h='50px'
                  outline='1px solid white'
                  outlineColor='blue.200'
                  key={cell}
                  bg={
                    snakeCells.has(cell)
                      ? 'green.500'
                      : cell === foodCell.value
                      ? 'violet'
                      : undefined
                  }
                ></Box>
              ))}
            </Flex>
          ))}
        </Box>
        <Controller
          changeDirection={(_direction: DIRECTION) => setDirection(_direction)}
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

function getNextNodeCoordsForDirection(node: Node, direction: DIRECTION) {
  switch (direction) {
    case DIRECTION.RIGHT:
      return {
        row: node.data.row,
        cell: node.data.cell + 1,
      };
    case DIRECTION.LEFT:
      return {
        row: node.data.row,
        cell: node.data.cell - 1,
      };
    case DIRECTION.UP:
      return {
        cell: node.data.cell,
        row: node.data.row - 1,
      };
    default:
      // case DIRECTION.DOWN
      return {
        cell: node.data.cell,
        row: node.data.row + 1,
      };
  }
}

// workaround: store every direction in the snake node data
function getDirectionForNode(node: Node<CellData>) {
  if (!node.next) return null;
  const { row, cell } = node.data!;
  const { row: nextRow, cell: nextCell } = node.next.data!;

  if (row === nextRow && cell + 1 === nextCell) return DIRECTION.RIGHT;
  if (row === nextRow && cell - 1 === nextCell) return DIRECTION.LEFT;
  if (row - 1 === nextRow && cell === nextCell) return DIRECTION.UP;
  if (row + 1 === nextRow && cell === nextCell) return DIRECTION.DOWN;
}

function getOppositeDirection(direction: DIRECTION) {
  if (direction === DIRECTION.LEFT) return DIRECTION.RIGHT;
  if (direction === DIRECTION.RIGHT) return DIRECTION.LEFT;
  if (direction === DIRECTION.DOWN) return DIRECTION.UP;
  // if (direction === DIRECTION.UP) return DIRECTION.DOWN;
  return DIRECTION.DOWN;
}

// function getNextNodeCoordsForDirection(node: Node, direction: DIRECTION) {}

function getNextNodeForDirection(
  node: Node<CellData>,
  direction: DIRECTION,
  board: number[][]
) {
  const nextNodeCoords = getNextNodeCoordsForDirection(node, direction);
  return new Node<CellData>({
    ...nextNodeCoords,
    value: board[nextNodeCoords.row][nextNodeCoords.cell],
    direction,
  });
}

function getFoodCell(board: number[][]) {
  let row = generateRandomNum(0, board.length - 1);
  let cell = generateRandomNum(0, board[0].length - 1);

  return board[row][cell];
}

function getFoodType() {
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

function changeDirection(
  newHead: Node,
  snake: SingleLinkedList<CellData>,
  snakeCells: Set<number>
) {
  // Check if it's out of bound. The newHead.data.value will be undefined, or you can check by checking the length of border etc..
  const newSnakeCells = new Set(snakeCells);
  newSnakeCells.delete(snake.tail!.data!.value);
  newSnakeCells.add(newHead.data.value);

  snake.moveList(newHead);

  return newSnakeCells;
}
