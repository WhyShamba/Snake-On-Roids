import { useEffect, useRef, useState } from 'react';
import { BOARD_SIZE, PER_PAGE, SNAKE_SPEED } from '../consts';
import firebase from '../firebase';
import { GamesCountType, LeaderBoardType } from '../types/types';
import { gameChooser } from '../utils/gameChooser';
import { mapToLeaderBoardType } from '../utils/mapToLeaderBoardType';

const getLeaderBoardWithQuery = async (
  leaderboardRef: firebase.firestore.CollectionReference<firebase.firestore.DocumentData>,
  gameType: GamesCountType
) => {
  const limitPlusOne = PER_PAGE + 1;
  const data = await leaderboardRef
    .limit(limitPlusOne)
    .orderBy(`game.${gameType}`, 'desc')
    .where(`game.${gameType}`, '!=', null)
    .get();

  return { data, hasMore: limitPlusOne === data.docs.length };
};

export const useGetLeaderboard = (boardSize: number, snakeSpeed: number) => {
  const [dataState, setData] = useState<{
    data: LeaderBoardType[] | undefined;
    hasMore: boolean;
  }>();
  const [loadingMore, setLoadingMore] = useState<boolean>(true); // on show more button
  const [loading, setLoading] = useState<boolean>(true); // when is changing leaderboard category
  const lastDoc = useRef<
    firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>
  >();
  const leaderboardRef = firebase.firestore().collection('leaderboard');
  const [gameType, setGameType] = useState<GamesCountType>(
    gameChooser(boardSize, snakeSpeed)
  );

  useEffect(() => {
    console.log('In use effect: ', boardSize, snakeSpeed);
    const newGameType = gameChooser(boardSize, snakeSpeed);
    setGameType(newGameType);
    const fetchLeaderBoard = async () => {
      setLoading(true);
      const { data, hasMore } = await getLeaderBoardWithQuery(
        leaderboardRef,
        newGameType
      );

      lastDoc.current = data.docs[data.docs.length - 2];
      const transformedData: LeaderBoardType[] = mapToLeaderBoardType(data);
      setData({
        data: transformedData.slice(0, PER_PAGE),
        hasMore,
      });

      setLoading(false);
    };

    fetchLeaderBoard();
  }, [boardSize, snakeSpeed]);

  console.log('The data', dataState, loadingMore);
  useEffect(() => {
    const fetchInitialData = async () => {
      const limitPlusOne = PER_PAGE + 1;
      const data = await leaderboardRef
        .limit(limitPlusOne)
        .orderBy(`game.${gameType}`, 'desc')
        .where(`game.${gameType}`, '!=', null)
        .get();

      console.log('first data: ', data.docs);

      //   -2 because im fetching +1 for pagination
      lastDoc.current = data.docs[data.docs.length - 2];
      const transformedData: LeaderBoardType[] = mapToLeaderBoardType(data);
      setData({
        data: transformedData.slice(0, PER_PAGE),
        hasMore: limitPlusOne === transformedData.length,
      });
      setLoadingMore(false);
    };
    fetchInitialData();
  }, []);

  const showMore = async () => {
    if (lastDoc.current) {
      const limitPlusOne = PER_PAGE + 1;

      setLoadingMore(true);
      const newData = await leaderboardRef
        .startAfter(lastDoc.current)
        .limit(limitPlusOne)
        .get();

      //   -2 because im fetching +1 for pagination
      lastDoc.current = newData.docs[newData.docs.length - 2];
      const transformedData = mapToLeaderBoardType(newData);

      setData({
        data: dataState?.data?.concat(transformedData.slice(0, PER_PAGE)),
        hasMore: limitPlusOne === transformedData.length,
      });
      setLoadingMore(false);
    }
  };

  return {
    hasMore: dataState?.hasMore,
    loadingMore,
    data: dataState?.data,
    showMore,
    gameType,
    isLoading: loading,
  };
};
