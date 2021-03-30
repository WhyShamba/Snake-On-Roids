import {
  Avatar,
  Box,
  Flex,
  HStack,
  VStack,
  Image,
  Text,
} from '@chakra-ui/react';
import React from 'react';
import { FoodType } from '../App';

interface AvatarBarProps {
  effects: {
    food: FoodType;
    duration: number | null;
  }[];
  score: number;
  maxScore: number;
}

export const AvatarBar: React.FC<AvatarBarProps> = ({
  effects,
  maxScore,
  score,
}) => {
  return (
    <Box pos='absolute' left={1} top={4} h='110px'>
      <Flex
        w='300px'
        align='center'
        bg='blackAlpha.500'
        p={2}
        borderRadius='md'
        boxShadow='md'
        mb={2}
      >
        <Avatar size='lg' name='Snake Avatar' src='/img/avatar.png' mr={2} />
        <VStack w='100%'>
          <Box bg='green.500' w='100%' borderRadius='sm' pl={2}>
            Score:{' '}
            <Text as='span' fontWeight='bold'>
              {score}
            </Text>
          </Box>
          <Box bg='blue.500' w='100%' borderRadius='sm' pl={2}>
            Max Score:{' '}
            <Text as='span' fontWeight='bold'>
              {score}
            </Text>
          </Box>
        </VStack>
      </Flex>
      <HStack pl={'28%'} spacing={3}>
        {effects.map((effect) => {
          let imageSrc = '/img/';
          switch (effect.food) {
            case 'steroid':
              imageSrc = imageSrc + 'roid.png';
              break;
            case 'creatine':
              imageSrc = imageSrc + 'creatine.webp';
              break;
            case 'meat':
              imageSrc = imageSrc + 'meat.png';
              break;
            default:
              imageSrc = imageSrc + 'protein.webp';
              break;
          }

          return (
            <Box
              d='flex'
              alignItems='center'
              flexDirection='column'
              key={effect.food}
            >
              <Image src={imageSrc} w='25px' h='25px' />
              <Text fontSize='xs'>
                {effect.duration === Infinity ? '∞' : `${effect.duration}s`}
              </Text>
            </Box>
          );
        })}
      </HStack>
    </Box>
  );
};
