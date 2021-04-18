import { LeaderBoardApiType } from '../../types/types';
import firebase from '../../firebase';
import { createValidUsername } from '../createValidUsername';

export const createLeaderboard = async (
  displayName: string,
  data: LeaderBoardApiType
) => {
  try {
    // This either creates/updates leaderboard for the current user
    await firebase
      .firestore()
      .collection('leaderboard')
      .doc(createValidUsername(displayName)) // Id
      .set(data, { merge: true });

    return true;
  } catch (_) {
    return false;
  }
};
