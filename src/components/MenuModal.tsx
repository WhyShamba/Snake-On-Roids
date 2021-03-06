import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import React from 'react';

interface MenuModalProps {
  onClose?: () => any;
  isOpen: boolean;
  headerText: string;
  children: JSX.Element | JSX.Element[];
  size?: '6xl' | 'lg';
}

export const MenuModal: React.FC<MenuModalProps> = ({
  isOpen,
  onClose,
  headerText,
  children,
  size = '6xl',
}) => {
  return (
    <Modal
      onClose={onClose ? onClose : () => {}}
      size={size}
      isOpen={isOpen}
      scrollBehavior='inside'
      returnFocusOnClose={false}
      autoFocus={false}
      isCentered
    >
      <ModalOverlay />
      <ModalContent
        bg='primary.main'
        color='white'
        boxShadow='lg'
        borderRadius='md'
        border='1px solid #ffffff0a'
        w='90%'
        fontSize={{ base: '0.8rem', lg: '1rem' }}
      >
        <ModalHeader fontSize={{ base: '2xl', lg: '3xl' }}>
          {headerText}
        </ModalHeader>
        {onClose && <ModalCloseButton _active={{}} _focus={{}} />}
        <ModalBody
          px={{ base: 3, lg: 6 }}
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
          {children}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
