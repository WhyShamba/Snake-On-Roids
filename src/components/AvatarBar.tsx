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
import { FoodType } from '../containers/Game';

interface AvatarBarProps {
  effects: {
    food: FoodType;
    duration: number | null;
  }[];
  score: number;
  untilNextFood: number;
}

export const AvatarBar: React.FC<AvatarBarProps> = ({
  effects,
  untilNextFood,
  score,
}) => {
  return (
    <Box pos='absolute' left={1} top={4} h='110px' zIndex={2}>
      <Flex
        w={{ base: '200px', lg: '350px' }}
        align='center'
        bg='blackAlpha.500'
        p={2}
        borderRadius='md'
        boxShadow='md'
        mb={2}
        fontSize={{ lg: '1rem', base: '0.8rem' }}
      >
        <Avatar size='lg' name='Snake Avatar' src='/img/avatar.png' mr={2} />
        <VStack w='100%'>
          <Box bg='green.500' w='100%' borderRadius='lg' pl={2}>
            Score:{' '}
            <Text as='span' fontWeight='bold'>
              {score}
            </Text>
          </Box>
          <Box bg='blue.500' w='100%' borderRadius='lg' pl={2}>
            Next food in:{' '}
            <Text as='span' fontWeight='bold'>
              {untilNextFood}
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
