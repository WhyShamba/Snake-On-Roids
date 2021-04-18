import { HighScoreType } from '../types/types';

export const updateInitialHighScore = (
  localHighScore: HighScoreType,
  dbHighScore: HighScoreType | null
): [Partial<HighScoreType>, boolean] => {
  let isChanged = false;

  // no high score submitted yet, is second case
  let toUpdate: Partial<HighScoreType> | HighScoreType = dbHighScore
    ? { ...dbHighScore }
    : {};

  if (
    (!dbHighScore?.gameOne && localHighScore.gameOne > 0) ||
    localHighScore.gameOne > dbHighScore?.gameOne!
  ) {
    toUpdate.gameOne = localHighScore.gameOne;
    isChanged = true;
  }

  if (
    localHighScore.gameTwo > dbHighScore?.gameTwo! ||
    (!dbHighScore?.gameTwo && localHighScore.gameTwo > 0)
  ) {
    toUpdate.gameTwo = localHighScore.gameTwo;
    isChanged = true;
  }

  if (
    localHighScore.gameThree > dbHighScore?.gameThree! ||
    (localHighScore.gameThree > 0 && !dbHighScore?.gameThree)
  ) {
    toUpdate.gameThree = localHighScore.gameThree;
    isChanged = true;
  }

  if (
    localHighScore.gameFour > dbHighScore?.gameFour! ||
    (localHighScore.gameFour > 0 && !dbHighScore?.gameFour)
  ) {
    toUpdate.gameFour = localHighScore.gameFour;
    isChanged = true;
  }

  if (
    localHighScore.gameFive > dbHighScore?.gameFive! ||
    (localHighScore.gameFive > 0 && !dbHighScore?.gameFive)
  ) {
    toUpdate.gameFive = localHighScore.gameFive;
    isChanged = true;
  }

  if (
    localHighScore.gameSix > dbHighScore?.gameSix! ||
    (localHighScore.gameSix > 0 && !dbHighScore?.gameSix)
  ) {
    toUpdate.gameSix = localHighScore.gameSix;
    isChanged = true;
  }

  if (
    localHighScore.gameSeven > dbHighScore?.gameSeven! ||
    (localHighScore.gameSeven > 0 && !dbHighScore?.gameSeven)
  ) {
    toUpdate.gameSeven = localHighScore.gameSeven;
    isChanged = true;
  }

  if (
    localHighScore.gameEight > dbHighScore?.gameEight! ||
    (localHighScore.gameEight > 0 && !dbHighScore?.gameEight)
  ) {
    toUpdate.gameEight = localHighScore.gameEight;
    isChanged = true;
  }

  if (
    localHighScore.gameNine > dbHighScore?.gameNine! ||
    localHighScore.gameNine > 0
  ) {
    toUpdate.gameNine = localHighScore.gameNine;
    isChanged = true;
  }

  return [toUpdate, isChanged];
};
