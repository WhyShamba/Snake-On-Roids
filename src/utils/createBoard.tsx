/* eslint-disable */
export const createBoard = (boardSize: number) => {
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
