import { Box, Image } from '@chakra-ui/react';
import React from 'react';
import { FoodType } from '../../containers/Game';

interface FoodCellProps {
  food: FoodType;
}

export const FoodCell: React.FC<FoodCellProps> = ({ food }) => {
  let image: any;
  switch (food) {
    case 'meat':
      image = <Image src='/img/meat.png' w='65%' h='65%' m='auto' />;
      break;
    case 'creatine':
      image = <Image src='/img/creatine.webp' w='65%' h='65%' m='auto' />;
      break;
    case 'protein':
      image = <Image src='/img/protein.webp' w='65%' h='65%' m='auto' />;
      break;
    default:
      image = <Image src='/img/roid.png' w='65%' h='65%' m='auto' />;
      break;
  }
  return (
    <Box w='100%' h='100%' d='flex'>
      {image}
    </Box>
  );
};
