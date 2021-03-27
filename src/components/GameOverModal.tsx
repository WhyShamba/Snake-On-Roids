import { RepeatIcon } from '@chakra-ui/icons';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Box,
  Text,
  Flex,
} from '@chakra-ui/react';
import React from 'react';

interface GameOverModalProps {
  isOpen: boolean;
  onClose: (...args: any) => any;
  score: number;
  onPlayAgain?: (...args: any) => any;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  onClose,
  score,
  onPlayAgain,
}) => {
  return (
    <Modal
      closeOnOverlayClick={false}
      isOpen={isOpen}
      onClose={onClose}
      isCentered
    >
      <ModalOverlay />
      <ModalContent color='white' bg='blue.800'>
        <ModalHeader textAlign='center' fontSize='3xl'>
          Game Over
        </ModalHeader>
        <ModalBody pb={6}>
          <Text textAlign='center' mb={6} fontWeight={600} fontSize='2xl'>
            Your max score is: {score}
          </Text>
          <Flex direction='column'>
            <Button
              mb={2}
              bg='blue.700'
              transition='all 0.2s'
              _hover={{
                bg: 'blue.900',
              }}
            >
              Menu
            </Button>
            <Button
              rightIcon={<RepeatIcon />}
              bg='blue.700'
              transition='all 0.2s'
              _hover={{
                bg: 'blue.900',
              }}
              onClick={onPlayAgain}
            >
              Play Again
            </Button>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
