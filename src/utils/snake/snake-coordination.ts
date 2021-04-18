import { DIRECTION, CellData } from '../../types/types';
import { Node, SingleLinkedList } from '../SingleLinkedList';

export function getNextNodeCoordsForDirection(
  node: Node,
  direction: DIRECTION
) {
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
export function getDirectionForNode(node: Node<CellData>) {
  if (!node.next) return null;
  const { row, cell } = node.data!;
  const { row: nextRow, cell: nextCell } = node.next.data!;

  if (row === nextRow && cell + 1 === nextCell) return DIRECTION.RIGHT;
  if (row === nextRow && cell - 1 === nextCell) return DIRECTION.LEFT;
  if (row - 1 === nextRow && cell === nextCell) return DIRECTION.UP;
  if (row + 1 === nextRow && cell === nextCell) return DIRECTION.DOWN;
}

export function getOppositeDirection(direction: DIRECTION) {
  if (direction === DIRECTION.LEFT) return DIRECTION.RIGHT;
  if (direction === DIRECTION.RIGHT) return DIRECTION.LEFT;
  if (direction === DIRECTION.DOWN) return DIRECTION.UP;
  // if (direction === DIRECTION.UP) return DIRECTION.DOWN;
  return DIRECTION.DOWN;
}

// function getNextNodeCoordsForDirection(node: Node, direction: DIRECTION) {}

export function getNextNodeForDirection(
  node: Node<CellData>,
  direction: DIRECTION,
  board: number[][]
) {
  const nextNodeCoords = getNextNodeCoordsForDirection(node, direction);
  return new Node<CellData>({
    ...nextNodeCoords,
    value: board[nextNodeCoords.row]?.[nextNodeCoords.cell],
    direction,
  });
}

// Move forward with the snake
export function changeDirection(
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
