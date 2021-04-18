import firebase from '../../firebase';
import { HighScoreType } from '../../types/types';
import { createValidUsername } from '../createValidUsername';

export const updateLeaderboard = async (
  displayName: string,
  newScore: HighScoreType
) => {
  try {
    await firebase
      .firestore()
      .collection('leaderboard')
      .doc(createValidUsername(displayName))
      .update({ game: newScore });
    return true;
  } catch (_) {
    return false;
  }
};
