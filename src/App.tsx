import React, { useEffect, useRef, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { Box, Center, Flex, Heading, Text } from '@chakra-ui/layout';
import { Node, SingleLinkedList } from './utils/SingleLinkedList';
import { Controller } from './components/Controller';
import { generateRandomNum } from './utils/generateRandomNum';

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

const SNAKE_SPEED = 500;
const SNAKE_SPEED_ON_ROIDS = SNAKE_SPEED * 1.75;
const SNAKE_SPEED_ON_CREATINE = SNAKE_SPEED * 1.5;

// Now into consideration we have that the rows and column will have same number of rows/columns
const getInitialSnakeCell = (board: number[][]) => {
  const row = Math.floor(board.length / 2) - 1;
  const cell = Math.floor(board[row].length / 2) - 1;

  return {
    row,
    cell,
    value: board[row][cell],
  };
};

function App() {
  const [board, setBoard] = useState(createBoard());
  const [controllerType, setControllerType] = useState<
    'wasd' | 'arrows' | 'controller'
  >('controller');
  const snakeRef = useRef(
    new SingleLinkedList(new Node(getInitialSnakeCell(board)))
  );
  const [snakeCells, setSnakeCells] = useState(
    new Set([snakeRef.current.head?.data?.value || 1])
  );
  // TODO: I think it's better with useRef. When interval is implemented
  // const [direction, setDirection] = useState<DIRECTION>(
  //   generateRandomNum(0, 3)
  // );
  const directionRef = useRef<DIRECTION>(generateRandomNum(0, 3));

  const snake = snakeRef.current;
  let direction = directionRef.current;
  useEffect(() => {
    console.log('Current direction: ', direction);
    // const snake = new SingleLinkedList(new Node(1));
    // snake.add(new Node(2));
    // snake.add(new Node(2.5));
    // snake.add(new Node(3));
    // snake.add(new Node(4));
    // snake.add(new Node(5));
    // console.log('Snake Head: ', snake.head);
    // snake.print();
    // snake.reverse();
    // snake.print();
  }, [direction]);

  // Or do: https://dev.to/prog585/setinterval-and-usestate-problem-2dd3
  useEffect(() => {
    // TODO: remove in future
    if (controllerType !== 'controller') {
      const interval = setInterval(() => {
        const newSnakeCells = new Set([snakeRef.current.head!.data!.value + 1]);
        snakeRef.current.head!.data!.value =
          snakeRef.current.head!.data!.value + 1;
        setSnakeCells(newSnakeCells);
      }, SNAKE_SPEED * 10);
      return () => clearInterval(interval);
    }
  }, [snakeCells]);

  const moveSnake = () => {
    console.log('The direction: ', direction);
    switch (direction) {
      case DIRECTION.RIGHT:
        setSnakeCells(
          changeDirection(
            new Node({
              ...snake.head!.data!,
              cell: snake.head!.data!.cell + 1,
              value: board[snake.head!.data!.row][snake.head!.data!.cell + 1],
            }),
            snake,
            snakeCells
          )
        );

        break;
      case DIRECTION.LEFT:
        setSnakeCells(
          changeDirection(
            new Node({
              ...snake.head!.data!,
              cell: snake.head!.data!.cell - 1,
              value: board[snake.head!.data!.row][snake.head!.data!.cell - 1],
            }),
            snake,
            snakeCells
          )
        );
        break;
      case DIRECTION.UP:
        setSnakeCells(
          changeDirection(
            new Node({
              ...snake.head!.data!,
              row: snake.head!.data!.row - 1,
              value: board[snake.head!.data!.row - 1][snake.head!.data!.cell],
            }),
            snake,
            snakeCells
          )
        );
        break;
      default:
        // case DIRECTION.DOWN
        setSnakeCells(
          changeDirection(
            new Node({
              ...snake.head!.data!,
              row: snake.head!.data!.row + 1,
              value: board[snake.head!.data!.row + 1][snake.head!.data!.cell],
            }),
            snake,
            snakeCells
          )
        );
        break;
    }
  };

  const changeDirectionHandler = (_direction: DIRECTION) => {
    // setDirection(_direction);
    direction = _direction;
    moveSnake();
  };

  return (
    <Center minH='100vh' bg='blue.900' color='white'>
      <Flex direction='column' align='center'>
        {/* Or image logo */}
        <Heading>Snake On Roids</Heading>
        <Text>Score: 0</Text>
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
                  bg={snakeCells.has(cell) ? 'green.500' : undefined}
                ></Box>
              ))}
            </Flex>
          ))}
        </Box>
        <Controller changeDirection={changeDirectionHandler} />
      </Flex>
    </Center>
  );
}

export default App;

function changeDirection(
  newHead: Node,
  snake: SingleLinkedList<{ row: number; cell: number; value: number }>,
  snakeCells: Set<number>
) {
  // Check if it's out of bound. The newHead.data.value will be undefined, or you can check by checking the length of border etc..
  const newSnakeCells = new Set(snakeCells);
  newSnakeCells.delete(snake.tail!.data!.value);
  newSnakeCells.add(newHead.data.value);

  snake.moveList(newHead);

  return newSnakeCells;
}
