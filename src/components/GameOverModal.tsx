import { RepeatIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Flex,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from '@chakra-ui/react';
import React, { useRef, useState } from 'react';
import { MdMailOutline } from 'react-icons/md';
import { SettingsButton } from './Settings/SettingsButton';
import firebase from '../firebase';
import { createValidUsername } from '../utils/createValidUsername';

interface GameOverModalProps {
  isOpen: boolean;
  onClose: (...args: any) => any;
  score: number;
  highestScore: number;
  onPlayAgain?: (...args: any) => any;
  onMenuClick?: (...args: any) => any;
  user: firebase.User | null | undefined;
  authLoading: boolean;
  onSubmit: (...args: any) => any;
  submitHighScore: (username: string) => any;
  newHighScore: boolean;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  onClose,
  score,
  highestScore,
  onPlayAgain,
  user,
  authLoading,
  onMenuClick,
  onSubmit,
  submitHighScore,
  newHighScore,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const signInWithGoogle = async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    await firebase.auth().signInWithPopup(provider);
    // Fetch to db check if user exists with that name, fetch highest score set it here. else 0
    // setHighestScore(0);
  };

  let newRecord;
  if (isOpen) {
    if (!user) {
      // Check if user is auth, if he is display congratulations new score added to leaderboard, if he's not show google login button
      newRecord = (
        <Box textAlign='center' mt={2}>
          <SettingsButton
            rightIcon={<MdMailOutline />}
            w='100%'
            onClick={signInWithGoogle}
            isLoading={authLoading}
          >
            Sign Up/In with Google
          </SettingsButton>
          <Text fontSize='xs'>
            <b>Want to submit your high score and compete againts friends?</b>{' '}
            Sign in fast and easy with google
          </Text>
        </Box>
      );
    } else if (newHighScore) {
      newRecord = (
        <VStack mt={2}>
          <Input
            type='text'
            ref={inputRef}
            autoComplete='off'
            textTransform='lowercase'
            maxLength={15}
            placeholder={`Enter username, default: ${createValidUsername(
              user.displayName!
            )}...`}
          />

          <SettingsButton
            rightIcon={<MdMailOutline />}
            w='100%'
            onClick={async () => {
              setSubmitLoading(true);
              await submitHighScore(
                inputRef.current?.value || user.displayName!
              );
              setSubmitLoading(false);
              onSubmit();
            }}
            isLoading={submitLoading}
          >
            Submit High Score
          </SettingsButton>
          <Text fontSize='sm' textAlign='center' mt={4}>
            <b>Congratualtions, you got new highscore!</b> If you don't enter
            username in the field above,{' '}
            <b>{createValidUsername(user.displayName!)}</b> will be used
          </Text>
        </VStack>
      );
    }
  }
  return (
    <Modal
      closeOnOverlayClick={false}
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      returnFocusOnClose={false}
      autoFocus={false}
    >
      <ModalOverlay />
      <ModalContent
        bg='primary.main'
        color='white'
        boxShadow='lg'
        borderRadius='md'
        border='1px solid #ffffff0a'
        w='90%'
      >
        <ModalHeader textAlign='center' fontSize='3xl'>
          Game Over
        </ModalHeader>
        <ModalBody pb={6}>
          {highestScore ? (
            <Text textAlign='center' mb={6} fontWeight={600} fontSize='2xl'>
              Your max score is: {highestScore}
            </Text>
          ) : null}
          <Text textAlign='center' mb={6} fontWeight={600} fontSize='2xl'>
            Score in this game: {score}
          </Text>
          <Flex direction='column'>
            <Button
              mb={2}
              bg='red.800'
              transition='all 0.2s'
              _hover={{
                bg: 'red.700',
              }}
              _active={{}}
              _focus={{}}
              onClick={onMenuClick}
            >
              Menu
            </Button>
            <Button
              rightIcon={<RepeatIcon />}
              bg='red.800'
              transition='all 0.2s'
              _hover={{
                bg: 'red.700',
              }}
              onClick={onPlayAgain}
              _active={{}}
              _focus={{}}
            >
              Play Again
            </Button>
            {newRecord}
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
