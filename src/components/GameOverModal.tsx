import { RepeatIcon } from '@chakra-ui/icons';
import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import React from 'react';

interface GameOverModalProps {
  isOpen: boolean;
  onClose: (...args: any) => any;
  score: number;
  onPlayAgain?: (...args: any) => any;
  onMenuClick?: (...args: any) => any;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  onClose,
  score,
  onPlayAgain,
  onMenuClick,
}) => {
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
      >
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
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
