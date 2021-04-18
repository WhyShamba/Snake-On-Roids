import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import {
  BOARD_SIZE,
  BOARD_SIZE_HIGH,
  BOARD_SIZE_MEDIUM,
  SNAKE_SPEED,
} from '../../consts';
import { useGetLeaderboard } from '../../custom-hooks/useGetLeaderboard';
import { LeaderboardPanel } from './LeaderboardPanel/LeaderboardPanel';

interface LeaderboardModalProps {
  onClose: () => any;
  isOpen: boolean;
  currentUserId: string;
}

const tabs = [
  {
    name: '10x10',
    size: BOARD_SIZE,
  },
  {
    name: '12x12',
    size: BOARD_SIZE,
  },
  {
    name: '15x15',
    size: BOARD_SIZE,
  },
];
export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  onClose,
  isOpen,
  currentUserId,
}) => {
  const [boardSize, setBoardSize] = useState(BOARD_SIZE);
  const [snakeSpeed, setSnakeSpeed] = useState(SNAKE_SPEED);
  const {
    data,
    showMore,
    loadingMore,
    hasMore,
    gameType,
    isLoading,
  } = useGetLeaderboard(boardSize, snakeSpeed);

  const changeIndex = (index: number) => {
    switch (index) {
      case 0:
        setBoardSize(BOARD_SIZE);
        break;
      case 1:
        setBoardSize(BOARD_SIZE_MEDIUM);
        break;
      default:
        setBoardSize(BOARD_SIZE_HIGH);
        break;
    }
  };

  return (
    <Modal
      onClose={onClose}
      size='xl'
      isOpen={isOpen}
      scrollBehavior='inside'
      isCentered
    >
      <ModalOverlay />
      <ModalContent w='90%' color='white' bg='primary.main'>
        <ModalHeader>LEADERBOARD</ModalHeader>
        <ModalCloseButton _focus={{}} _active={{}} />
        <ModalBody
          p={0}
          px={2}
          css={`
            ::-webkit-scrollbar-track {
              -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
              border-radius: 10px;
            }

            ::-webkit-scrollbar {
              width: 14px;
              // background-color: #171717;
              background-color: black;
              border-left: 1px solid #3a3232;
            }

            ::-webkit-scrollbar-thumb {
              border-radius: 10px;
              -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
              background-color: #171717;
            }
          `}
        >
          <Tabs colorScheme='red' isFitted isLazy onChange={changeIndex}>
            <TabList>
              {tabs.map((tab) => (
                <Tab
                  key={tab.name}
                  _active={{ borderBottomColor: 'primary.main' }}
                  _focus={{ borderBottomColor: 'primary.main !imporant' }}
                >
                  Board: {tab.name}
                </Tab>
              ))}
            </TabList>
            <TabPanels>
              {tabs.map((tab) => (
                <TabPanel p={0} py={2} key={tab.name}>
                  <LeaderboardPanel
                    loadingMore={loadingMore}
                    showMore={showMore}
                    leaderBoard={data}
                    hasMore={hasMore}
                    currentUserId={currentUserId}
                    setSnakeSpeed={(val) => setSnakeSpeed(val)}
                    gameType={gameType}
                    loading={isLoading}
                  />
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
