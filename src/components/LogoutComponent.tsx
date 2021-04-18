import { Button, Flex, Text } from '@chakra-ui/react';
import React from 'react';
import { createValidUsername } from '../utils/createValidUsername';

interface LogoutComponentProps {
  displayName: string;
  logout: () => any;
}

export const LogoutComponent: React.FC<LogoutComponentProps> = ({
  displayName,
  logout,
}) => {
  return (
    <Flex pos='absolute' bottom={2} right={2} color='#484747' fontSize='xs'>
      <Text mr={1}>
        <b>Account:</b> {createValidUsername(displayName)}
      </Text>
      <Button fontSize='xs' variant='link' onClick={logout} color='#484747'>
        (Logout)
      </Button>
    </Flex>
  );
};
