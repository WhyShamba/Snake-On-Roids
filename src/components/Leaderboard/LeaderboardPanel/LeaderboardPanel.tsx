import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import React from 'react';
import { LeaderboardChildPanel } from './LeaderboardChildPanel';
import { GamesCountType, LeaderBoardType } from '../../../types/types';
import {
  SNAKE_SPEED,
  SNAKE_SPEED_HIGH,
  SNAKE_SPEED_MEDIUM,
} from '../../../consts';

interface LeaderboardPanelProps {
  leaderBoard?: LeaderBoardType[];
  showMore: () => any;
  setSnakeSpeed: (value: number) => any;
  loadingMore: boolean;
  loading: boolean;
  hasMore?: boolean;
  currentUserId: string;
  gameType: GamesCountType;
}

const tabs = ['Speed: LOW', 'Speed: MEDIUM', 'Speed: HIGH'];
export const LeaderboardPanel: React.FC<LeaderboardPanelProps> = ({
  leaderBoard: leaderBoardSnapshots,
  showMore,
  loadingMore,
  loading,
  hasMore,
  currentUserId,
  setSnakeSpeed,
  gameType,
}) => {
  const changeIndex = (index: number) => {
    switch (index) {
      case 0:
        setSnakeSpeed(SNAKE_SPEED);
        break;
      case 1:
        setSnakeSpeed(SNAKE_SPEED_MEDIUM);
        break;
      default:
        setSnakeSpeed(SNAKE_SPEED_HIGH);
        break;
    }
  };

  return (
    <Tabs
      colorScheme='red'
      isFitted
      isLazy
      orientation='vertical'
      onChange={changeIndex}
    >
      <TabList>
        {tabs.map((tab) => (
          <Tab
            key={tab}
            _active={{ borderBottomColor: 'primary.main' }}
            _focus={{ borderBottomColor: 'primary.main !imporant' }}
          >
            {tab}
          </Tab>
        ))}
      </TabList>
      <TabPanels>
        {tabs.map((tab) => (
          <TabPanel key={tab} px={8}>
            <LeaderboardChildPanel
              leaderBoard={leaderBoardSnapshots}
              showMore={showMore}
              loadingMore={loadingMore}
              hasMore={hasMore}
              currentUserId={currentUserId}
              gameType={gameType}
              loading={loading}
            />
          </TabPanel>
        ))}
      </TabPanels>
    </Tabs>
  );
};
