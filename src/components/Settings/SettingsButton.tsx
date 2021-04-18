import { Button, ButtonProps } from '@chakra-ui/react';
import React from 'react';

interface SettingsButtonProps extends ButtonProps {
  children: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  isActive?: boolean;
}

export const SettingsButton: React.FC<SettingsButtonProps> = ({
  children,
  onClick,
  isActive,
  ...rest
}) => {
  return (
    <Button
      bg='red.800'
      w={{ base: '30%', lg: '25%' }}
      _hover={{ bg: 'red.700' }}
      _focus={{}}
      _active={{}}
      onClick={onClick}
      border={isActive ? '1px solid white' : undefined}
      {...rest}
    >
      {children}
    </Button>
  );
};
