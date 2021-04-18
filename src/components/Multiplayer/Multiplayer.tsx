import {
  Text,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
  Switch,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@chakra-ui/react';
import React, { useContext, useRef } from 'react';
import { MdArrowDropDown } from 'react-icons/md';
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
          <TabPanel minH='464px' p={{ base: 0, lg: 4 }} pt={7}>
            <Setting settingName='SNAKE SPEED:'>
              <SettingsButton
                onClick={() => ctx.multiplayer.setSnakeSpeed(SNAKE_SPEED)}
                isActive={ctx.multiplayer.snakeSpeed === SNAKE_SPEED}
              >
                LOW
              </SettingsButton>
              <SettingsButton
                onClick={() =>
                  ctx.multiplayer.setSnakeSpeed(SNAKE_SPEED_MEDIUM)
                }
                isActive={ctx.multiplayer.snakeSpeed === SNAKE_SPEED_MEDIUM}
              >
                MEDIUM
              </SettingsButton>
              <SettingsButton
                onClick={() => ctx.multiplayer.setSnakeSpeed(SNAKE_SPEED_HIGH)}
                isActive={ctx.multiplayer.snakeSpeed === SNAKE_SPEED_HIGH}
              >
                HIGH
              </SettingsButton>
            </Setting>
            <Setting settingName='BOARD SIZE:'>
              <SettingsButton
                onClick={() => ctx.multiplayer.setBoardSize(BOARD_SIZE)}
                isActive={ctx.multiplayer.boardSize === BOARD_SIZE}
              >
                10 X 10
              </SettingsButton>
              <SettingsButton
                onClick={() => ctx.multiplayer.setBoardSize(BOARD_SIZE_MEDIUM)}
                isActive={ctx.multiplayer.boardSize === BOARD_SIZE_MEDIUM}
              >
                12 X 12
              </SettingsButton>
              <SettingsButton
                onClick={() => ctx.multiplayer.setBoardSize(BOARD_SIZE_HIGH)}
                isActive={ctx.multiplayer.boardSize === BOARD_SIZE_HIGH}
              >
                15 x 15
              </SettingsButton>
            </Setting>
            <Setting settingName='Duration game:'>
              <Flex direction='column' w='95%' align='center'>
                <Switch
                  size='lg'
                  mb={4}
                  onChange={ctx.multiplayer.toggleWithTimer}
                  isChecked={ctx.multiplayer.withTimer}
                  colorScheme='red'
                />
                <FormControl isDisabled={!ctx.multiplayer.withTimer}>
                  <FormLabel>
                    The snake with highest score wins after:
                  </FormLabel>
                  <Select
                    icon={<MdArrowDropDown />}
                    bg='primary.main'
                    onChange={(e) =>
                      ctx.multiplayer.setGameDuration(+e.target.value)
                    }
                    value={ctx.multiplayer.gameDuration.toString()}
                  >
                    <option style={{ background: '#171717' }} value='20'>
                      20 seconds
                    </option>
                    <option style={{ background: '#171717' }} value='45'>
                      45 seconds
                    </option>
                    <option style={{ background: '#171717' }} value='60'>
                      60 seconds
                    </option>
                    <option style={{ background: '#171717' }} value='75'>
                      75 seconds
                    </option>
                    <option style={{ background: '#171717' }} value='90'>
                      90 seconds
                    </option>
                    <option style={{ background: '#171717' }} value='120'>
                      120 seconds
                    </option>
                    <option style={{ background: '#171717' }} value='180'>
                      180 seconds
                    </option>
                  </Select>
                </FormControl>
              </Flex>
            </Setting>
            <Setting settingName='Max Performance'>
              <Flex
                w='95%'
                direction={{ base: 'column', lg: 'row' }}
                justify='center'
                align='center'
              >
                <Switch
                  size='lg'
                  onClick={ctx.multiplayer.toggleBetterPerf as any}
                  isChecked={ctx.multiplayer.betterPerf || true}
                  defaultChecked={true}
                  colorScheme='red'
                  isDisabled
                />
                <Text fontSize='md' ml={4}>
                  If checked, your game might be laggy depending on your
                  PC/Mobile Performance. For old and low performance devices
                  this option should be off (<b>Default: ON</b>)
                </Text>
              </Flex>
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
            <form>
              <FormControl>
                <FormLabel>Invitation Key</FormLabel>
                <Input
                  type='text'
                  ref={inputRef}
                  autoComplete='off'
                  textTransform='uppercase'
                  maxLength={5}
                  isRequired
                />
              </FormControl>
              <SettingsButton
                w='100%'
                mx='auto'
                display='block'
                mt={8}
                type='submit'
                onClick={(e) => {
                  e.preventDefault();
                  if (
                    inputRef.current?.value &&
                    inputRef.current.value.length === 5
                  )
                    handleMultiplayer(
                      (inputRef.current.value as string).toUpperCase()
                    );
                }}
              >
                Join
              </SettingsButton>
            </form>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </MenuModal>
  );
};
