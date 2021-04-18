import firebase from '../firebase';
import { HighScoreType } from '../types/types';
import { createValidUsername } from './createValidUsername';

export const userExists = async (
  displayName: string
): Promise<false | { highScore: HighScoreType; username: string }> => {
  const user = await firebase
    .firestore()
    .collection('leaderboard')
    .doc(createValidUsername(displayName))
    .get();

  if (!user.exists) return false;

  const rawUser = user.data();
  return {
    highScore: rawUser!.game,
    username: rawUser!.name,
  };
};
