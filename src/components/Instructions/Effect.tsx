import { Flex, UnorderedList, ListItem, Text } from '@chakra-ui/react';
import React from 'react';
import { FoodType } from '../../containers/Game';
import { foodPicker } from '../../utils/foodPicker';
import parse from 'html-react-parser';

interface EffectProps {
  food: FoodType;
  rules: string[];
}

export const Effect: React.FC<EffectProps> = ({ food, rules }) => {
  const image = foodPicker(food, {
    w: '100px',
    h: '100px',
  });
  return (
    <Flex alignItems='center'>
      <Flex direction='column' justify='center' alignItems='center' mr={14}>
        {image}
        <Text fontWeight='bold' textTransform='capitalize'>
          {food}
        </Text>
      </Flex>
      <Flex direction='column'>
        <Text>On consumption:</Text>
        <UnorderedList listStylePosition='inside' listStyleType='none'>
          {rules.map((rule, index) => (
            <ListItem key={index}>{parse(rule)}</ListItem>
          ))}
        </UnorderedList>
      </Flex>
    </Flex>
  );
};
