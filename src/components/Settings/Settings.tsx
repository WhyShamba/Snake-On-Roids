import {
  Box,
  Image,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Switch,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@chakra-ui/react';
import React, { useContext } from 'react';
import { MdGraphicEq } from 'react-icons/md';
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
import { Setting } from './Setting';
import { SettingsButton } from './SettingsButton';

interface InstructionsProps {
  onClose: () => any;
  isOpen: boolean;
}

export const Settings: React.FC<InstructionsProps> = ({ onClose, isOpen }) => {
  const ctx = useContext(MainContext);

  return (
    <MenuModal headerText='Settings' onClose={onClose} isOpen={isOpen}>
      <Tabs colorScheme='red' isFitted>
        <TabList>
          <Tab
            fontSize={{ base: '3.5vw', lg: '1rem' }}
            _focus={{}}
            _active={{}}
          >
            GAME SETTINGS
          </Tab>
          <Tab
            fontSize={{ base: '3.5vw', lg: '1rem' }}
            _focus={{}}
            _active={{}}
          >
            CONTROLLS
          </Tab>
          <Tab
            fontSize={{ base: '3.5vw', lg: '1rem' }}
            _focus={{}}
            _active={{}}
          >
            SOUND
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
          </TabPanel>
          <TabPanel h='464px' p={{ base: 0, lg: 4 }} pt={7}>
            <Setting settingName={'Keybindings for controlling the snake:'}>
              <Image
                src='/img/wasd.png'
                mr={10}
                h={{ base: '70px', lg: '160px' }}
              />
              <Image src='/img/arrs.png' h={{ base: '70px', lg: '160px' }} />
            </Setting>
            <Setting settingName='Disable Controller (not recommended for mobile users)'>
              <Switch
                size='lg'
                onChange={ctx.toggleControllerHandler}
                isChecked={ctx.disableController}
                colorScheme='red'
              />
            </Setting>
          </TabPanel>
          <TabPanel h='464px'>
            <Setting settingName='General Volume'>
              <Slider
                aria-label='volume'
                defaultValue={ctx.musicVolume * 100}
                onChange={(value) => ctx.setMusicVolume(value / 100)}
              >
                <SliderTrack bg='red.100'>
                  <SliderFilledTrack bg='tomato' />
                </SliderTrack>
                <SliderThumb boxSize={6}>
                  <Box color='tomato' as={MdGraphicEq} />
                </SliderThumb>
              </Slider>
            </Setting>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </MenuModal>
  );
};
