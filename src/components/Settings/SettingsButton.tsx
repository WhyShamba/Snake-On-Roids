import { Button } from '@chakra-ui/react';
import React from 'react';

interface SettingsButtonProps {
  children: string;
  onClick?: any;
  isActive?: boolean;
}

export const SettingsButton: React.FC<SettingsButtonProps> = ({
  children,
  onClick,
  isActive,
}) => {
  return (
    <Button
      bg='red.800'
      w='25%'
      _hover={{ bg: 'red.700' }}
      _focus={{}}
      _active={{}}
      onClick={onClick}
      border={isActive ? '1px solid white' : undefined}
    >
      {children}
    </Button>
  );
};
