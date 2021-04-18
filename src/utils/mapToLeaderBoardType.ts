import firebase from '../firebase';
import { LeaderBoardType, LeaderBoardApiType } from '../types/types';

export const mapToLeaderBoardType = (
  snapshots: firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>
) => {
  const transformedData: LeaderBoardType[] = snapshots.docs.map((snapshot) => {
    const newDoc: LeaderBoardApiType = snapshot.data() as any;
    return {
      ...newDoc,
      id: snapshot.id,
    };
  });

  return transformedData;
};
