import { Box, Center, Flex, Spinner, Text, VStack } from '@chakra-ui/react';
import React from 'react';
import { GamesCountType, LeaderBoardType } from '../../../types/types';
import { SettingsButton } from '../../Settings/SettingsButton';
import { LeaderBoardScore } from './ScoreTable';

interface LeaderboardChildPanelProps {
  leaderBoard?: LeaderBoardType[];
  showMore: () => any;
  loadingMore: boolean;
  loading: boolean;
  hasMore?: boolean;
  currentUserId: string;
  gameType: GamesCountType;
}

export const LeaderboardChildPanel: React.FC<LeaderboardChildPanelProps> = ({
  leaderBoard,
  showMore,
  loadingMore,
  hasMore,
  currentUserId,
  gameType,
  loading,
}) => {
  let scoreHeader;
  let score;
  if (leaderBoard && !loading) {
    if (leaderBoard.length > 0) {
      scoreHeader = !loading && (
        <Flex justify='space-between' fontWeight='bold' fontSize='lg' mb={2}>
          <Text>NAME:</Text>
          <Text>SCORE:</Text>
        </Flex>
      );
      score = leaderBoard.map((item, index) => {
        return (
          <LeaderBoardScore
            key={item.id}
            leaderBoardData={item}
            index={index + 1}
            currentUserId={currentUserId}
            gameType={gameType}
          />
        );
      });
    } else {
      score = (
        <Center textAlign='center' h='250px' fontSize='sm' w='50%' minW='195px'>
          Score is not set yet for this category. Be the first one!
        </Center>
      );
    }
  } else {
    // Loading state
    score = (
      <Box
        d='inline-flex'
        w='100%'
        justifyContent='center'
        alignItems='center'
        h='200px'
      >
        <Spinner />
      </Box>
    );
  }
  return (
    <>
      {scoreHeader}
      <VStack>{score}</VStack>
      {hasMore && (
        <SettingsButton
          mt={4}
          mx='auto'
          d='flex'
          onClick={showMore}
          isLoading={loadingMore}
        >
          Show More
        </SettingsButton>
      )}
    </>
  );
};
