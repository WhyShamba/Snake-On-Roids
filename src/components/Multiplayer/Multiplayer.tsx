import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@chakra-ui/react';
import React, { useContext, useRef, useState } from 'react';
import {
  BOARD_SIZE,
  BOARD_SIZE_HIGH,
  BOARD_SIZE_MEDIUM,
  SNAKE_SPEED,
  SNAKE_SPEED_HIGH,
  SNAKE_SPEED_MEDIUM,
} from '../../consts';
import { MainContext } from '../../context';
import { MenuModal } from '../MenuModal';
import { Setting } from '../Settings/Setting';
import { SettingsButton } from '../Settings/SettingsButton';

interface MultiplayerProps {
  onClose: () => any;
  isOpen: boolean;
  handleMultiplayer: (...args: any) => any;
}

export const Multiplayer: React.FC<MultiplayerProps> = ({
  isOpen,
  onClose,
  handleMultiplayer,
}) => {
  // TODO: this might need to be different ctx and settings for multiplayer games
  const ctx = useContext(MainContext);
  const inputRef = useRef<any>(null);

  return (
    <MenuModal headerText='Multiplayer' onClose={onClose} isOpen={isOpen}>
      <Tabs colorScheme='red' isFitted>
        <TabList>
          <Tab
            fontSize={{ base: '3.5vw', lg: '1rem' }}
            _focus={{}}
            _active={{}}
          >
            Create Game
          </Tab>
          <Tab
            fontSize={{ base: '3.5vw', lg: '1rem' }}
            _focus={{}}
            _active={{}}
          >
            Join Game
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel h='464px' p={{ base: 0, lg: 4 }} pt={7}>
            <Setting settingName='SNAKE SPEED:'>
              <SettingsButton
                onClick={() => ctx.setSnakeSpeed(SNAKE_SPEED)}
                isActive={ctx.snakeSpeed === SNAKE_SPEED}
              >
                LOW
              </SettingsButton>
              <SettingsButton
                onClick={() => ctx.setSnakeSpeed(SNAKE_SPEED_MEDIUM)}
                isActive={ctx.snakeSpeed === SNAKE_SPEED_MEDIUM}
              >
                MEDIUM
              </SettingsButton>
              <SettingsButton
                onClick={() => ctx.setSnakeSpeed(SNAKE_SPEED_HIGH)}
                isActive={ctx.snakeSpeed === SNAKE_SPEED_HIGH}
              >
                HIGH
              </SettingsButton>
            </Setting>
            <Setting settingName='BOARD SIZE:'>
              <SettingsButton
                onClick={() => ctx.setBoardSize(BOARD_SIZE)}
                isActive={ctx.boardSize === BOARD_SIZE}
              >
                10 X 10
              </SettingsButton>
              <SettingsButton
                onClick={() => ctx.setBoardSize(BOARD_SIZE_MEDIUM)}
                isActive={ctx.boardSize === BOARD_SIZE_MEDIUM}
              >
                12 X 12
              </SettingsButton>
              <SettingsButton
                onClick={() => ctx.setBoardSize(BOARD_SIZE_HIGH)}
                isActive={ctx.boardSize === BOARD_SIZE_HIGH}
              >
                15 x 15
              </SettingsButton>
            </Setting>
            <SettingsButton
              w='100%'
              mx='auto'
              display='block'
              mt={8}
              onClick={handleMultiplayer}
            >
              Create Game
            </SettingsButton>
          </TabPanel>
          <TabPanel h='464px' p={{ base: 0, lg: 4 }} pt={7}>
            <FormControl>
              <FormLabel>Invitation Key</FormLabel>
              <Input type='text' ref={inputRef} />
            </FormControl>
            <SettingsButton
              w='100%'
              mx='auto'
              display='block'
              mt={8}
              onClick={() => handleMultiplayer(inputRef.current.value)}
            >
              Join
            </SettingsButton>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </MenuModal>
  );
};
