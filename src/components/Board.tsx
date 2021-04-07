import { Flex, Box } from '@chakra-ui/react';
import React from 'react';
import { useRef } from 'react';
import { FoodCell } from './Cells/FoodCell';
import { HeadCell } from './Cells/HeadCell';
import { StandardCell } from './Cells/StandardCell';
import { TailCell } from './Cells/TailCell';
import { SingleLinkedList } from '../utils/SingleLinkedList';
import { CellData, FoodType } from '../types/types';

interface BoardProps {
  board: number[][];
  snakeRef: React.MutableRefObject<SingleLinkedList<CellData>>;
  foodCell: {
    value: number;
    food: FoodType;
  };
  snakeCells: Set<number>;
}

const Board: React.FC<BoardProps> = ({
  board,
  snakeRef,
  foodCell,
  snakeCells,
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
              // Let this be standard cell
              let cellType: any = null;
              if (snakeCells.has(cell)) {
                if (cell === snakeRef.current.head!.data!.value) {
                  cellType = (
                    <HeadCell
                      direction={snakeRef.current.head!.data!.direction}
                    />
                  );
                } else if (
                  snakeRef.current.tail?.data?.value === cell &&
                  snakeRef.current.tail.data.value !==
                    snakeRef.current.head?.data?.value
                ) {
                  const snakeTailDirection = snakeRef.current.tail!.data!
                    .direction;
                  const snakeTailNextDirection =
                    snakeRef.current.tail?.next?.data?.direction;

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
                    />
                  );
                }
              } else if (cell === foodCell.value ? 'violet' : undefined) {
                cellType = <FoodCell food={foodCell.food} />;
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

export default React.memo(Board);
