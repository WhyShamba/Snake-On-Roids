import { Flex, HStack, Text } from '@chakra-ui/react';
import React from 'react';

interface SettingProps {
  settingName: string;
  children: JSX.Element | JSX.Element[];
}

export const Setting: React.FC<SettingProps> = ({ settingName, children }) => {
  return (
    <Flex flexDir='column' p={2} pb={4} mb={4}>
      <Text
        fontSize='xl'
        fontWeight='bold'
        mb={4}
        textAlign='center'
        textTransform='uppercase'
      >
        {settingName}
      </Text>
      <HStack
        w='100%'
        justify='center'
        spacing={8}
        boxShadow='inner'
        border='1px solid '
        borderColor='primary.borderColor'
        py={4}
      >
        {children}
      </HStack>
    </Flex>
  );
};
