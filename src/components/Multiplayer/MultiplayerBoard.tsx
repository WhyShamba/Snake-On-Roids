import { Flex, Box } from '@chakra-ui/react';
import React from 'react';
import { useRef } from 'react';
import { CellData, FoodType } from '../../types/types';
import { SingleLinkedList } from '../../utils/SingleLinkedList';
import { FoodCell } from '../Cells/FoodCell';
import { HeadCell } from '../Cells/HeadCell';
import { StandardCell } from '../Cells/StandardCell';
import { TailCell } from '../Cells/TailCell';

interface MultiplayerBoardProps {
  board: number[][];
  snakeRef: React.MutableRefObject<SingleLinkedList<CellData>>;
  enemySnakeRef: React.MutableRefObject<SingleLinkedList<CellData> | null>;
  foodCell: {
    value: number;
    food: FoodType;
  };
  enemyFoodCell: {
    value: number;
    food: FoodType;
  } | null;
  snakeCells: Set<number>;
  enemyCells: Set<number> | null;
}

const MultiplayerBoard: React.FC<MultiplayerBoardProps> = ({
  board,
  snakeRef,
  foodCell,
  snakeCells,
  enemyCells,
  enemyFoodCell,
  enemySnakeRef,
}) => {
  const cellRef = useRef<HTMLDivElement | null>(null);

  return (
    <Flex
      direction='column'
      align='center'
      boxShadow='lg'
      borderRadius='md'
      border='1px solid #ffffff0a'
      p={{ base: 2, lg: 10 }}
      w={{ base: '95%', lg: 'auto' }}
      bg='primary.main'
      zIndex={1}
      className='parent-board'
    >
      <Box
        outline='2px solid white'
        outlineColor='#2f2828'
        w={{ base: '100%', lg: '550px' }}
        className='board'
      >
        {board.map((row, index) => (
          <Flex key={index}>
            {row.map((cell) => {
              let bg = 'green.500';
              let snake = snakeRef;
              if (enemyCells?.has(cell) && enemySnakeRef.current) {
                snake = enemySnakeRef as typeof snakeRef;
                bg = 'red';
              }

              let cellType: any = null;
              if (snakeCells.has(cell) || enemyCells?.has(cell)) {
                if (cell === snake.current.head!.data!.value) {
                  cellType = (
                    <HeadCell
                      direction={snake.current.head!.data!.direction}
                      bg={bg}
                    />
                  );
                } else if (
                  snake.current.tail?.data?.value === cell &&
                  snake.current.tail.data.value !==
                    snake.current.head?.data?.value
                ) {
                  const snakeTailDirection = snake.current.tail!.data!
                    .direction;
                  const snakeTailNextDirection =
                    snake.current.tail?.next?.data?.direction;

                  cellType = (
                    <TailCell
                      direction={snakeTailDirection}
                      nextDirection={snakeTailNextDirection}
                      // If it will change direction in the next step
                      isTransitional={
                        snakeTailDirection !== snakeTailNextDirection
                      }
                      bg={bg}
                    />
                  );
                } else {
                  const match = snakeRef.current.find(
                    (node) => node.data?.value === cell
                  );

                  const currentDirection = match?.currentNode.data?.direction;
                  const nextDirection = match?.nextNode?.data?.direction;

                  cellType = (
                    <StandardCell
                      direction={currentDirection}
                      nextDirection={nextDirection}
                      isTransitional={currentDirection !== nextDirection}
                      bg={bg}
                    />
                  );
                }
              } else if (cell === foodCell.value) {
                cellType = <FoodCell food={foodCell.food} />;
              } else if (cell === enemyFoodCell?.value) {
                cellType = (
                  <FoodCell food={foodCell.food} bg={'red'} opacity='0.2' />
                );
              }

              return (
                <Box
                  h={`${cellRef.current?.clientWidth}px`}
                  ref={cellRef}
                  flex={1}
                  outline='1px solid #2f2828'
                  key={cell}
                >
                  {cellType}
                </Box>
              );
            })}
          </Flex>
        ))}
      </Box>
    </Flex>
  );
};

export default React.memo(MultiplayerBoard);
