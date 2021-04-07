import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import React from 'react';

interface GetReadyModalProps {
  isOpen: boolean;
  onClose: (...args: any) => any;
  count: number;
}

export const GetReadyModal: React.FC<GetReadyModalProps> = ({
  isOpen,
  onClose,
  count,
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
        w='90%'
      >
        <ModalHeader textAlign='center' fontSize='3xl'>
          Game staring in:
        </ModalHeader>
        <ModalBody pb={6}>
          <Text textAlign='center' fontWeight={600} fontSize='2xl'>
            {count}
          </Text>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
