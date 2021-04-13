import { Box, Flex } from '@chakra-ui/react';
import React, { useRef } from 'react';
import { FoodCell as FoodCellType, SnakeType } from '../../types/types';
import { FoodCell } from '../Cells/FoodCell';
import { HeadCell } from '../Cells/HeadCell';
import { StandardCell } from '../Cells/StandardCell';
import { TailCell } from '../Cells/TailCell';

interface MultiplayerBoardProps {
  board: number[][];
  snake: SnakeType;
  enemySnakeRef?: SnakeType;
  foodCell: FoodCellType;
  enemyFoodCell?: FoodCellType | null;
  snakeCells: Array<number>;
  enemyCells?: Array<number>;
  snakeCellsToBeRemoved?: Array<number>;
}

const MultiplayerBoard: React.FC<MultiplayerBoardProps> = ({
  board,
  snake,
  foodCell,
  snakeCells,
  enemyCells,
  enemyFoodCell,
  enemySnakeRef: enemySnake,
  snakeCellsToBeRemoved,
}) => {
  const cellRef = useRef<HTMLDivElement | null>(null);

  return (
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
            let currentSnake = snake;

            if (enemyCells?.includes(cell) && enemySnake) {
              currentSnake = enemySnake;
              bg = 'red';
            }

            let cellType: any = null;
            if (
              (snakeCells.includes(cell) &&
                !snakeCellsToBeRemoved?.includes(cell)) ||
              enemyCells?.includes(cell)
            ) {
              if (cell === currentSnake.head!.data!.value) {
                cellType = (
                  <HeadCell
                    direction={currentSnake.head!.data!.direction}
                    bg={bg}
                  />
                );
              } else if (
                currentSnake.tail?.data?.value === cell &&
                currentSnake.tail.data.value !== currentSnake.head?.data?.value
              ) {
                const snakeTailDirection = currentSnake.tail!.data!.direction;
                const snakeTailNextDirection =
                  currentSnake.tail?.next?.data?.direction;

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
                let match;
                if (currentSnake.find) {
                  match = currentSnake?.find(
                    (node) => node.data?.value === cell
                  );
                }

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
                <FoodCell food={enemyFoodCell.food} bg={'red'} opacity='0.2' />
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
  );
};

export default React.memo(MultiplayerBoard);
