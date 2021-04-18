import { Flex, Text } from '@chakra-ui/react';
import React from 'react';
import { GamesCountType, LeaderBoardType } from '../../../types/types';

interface LeaderBoardScoreProps {
  leaderBoardData: LeaderBoardType;
  index: number;
  currentUserId: string;
  gameType: GamesCountType;
}

export const LeaderBoardScore: React.FC<LeaderBoardScoreProps> = ({
  leaderBoardData,
  index,
  currentUserId,
  gameType,
}) => {
  let style;
  let additionalText;
  if (leaderBoardData.id === currentUserId) {
    style = { fontWeight: 600, background: '#00000024' };
    additionalText = ' (me)';
  }

  return (
    <Flex
      px={2}
      borderRadius='lg'
      py={4}
      _hover={{ bg: '#393838' }}
      w='100%'
      alignItems='center'
      borderBottom='1px solid black'
      borderColor='primary.borderColor'
      boxShadow='inner'
      {...style}
    >
      <Text mr={2}>{index}.</Text>
      <Text>
        {leaderBoardData.name}
        {additionalText}
      </Text>
      <Text ml='auto'>{leaderBoardData.game[gameType]}</Text>
    </Flex>
  );
};
