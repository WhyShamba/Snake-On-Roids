import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
} from '@chakra-ui/react';
import React from 'react';

interface SafariAlertProps {
  onClose: any;
}

export const SafariAlert: React.FC<SafariAlertProps> = ({ onClose }) => {
  return (
    <Alert status='error' variant='solid' fontSize={{ base: 'sm', lg: 'md' }}>
      <AlertIcon />
      <AlertTitle mr={2}>Your browser is Safari!</AlertTitle>
      <AlertDescription>
        If you're on safari you might experience some problems when trying to
        join multiplayer game
      </AlertDescription>
      <CloseButton
        position='absolute'
        right='8px'
        top='8px'
        onClick={onClose}
      />
    </Alert>
  );
};
