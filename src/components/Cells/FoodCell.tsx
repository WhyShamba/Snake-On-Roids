import { Box } from '@chakra-ui/react';
import React from 'react';
import { FoodType } from '../../containers/Game';
import { foodPicker } from '../../utils/foodPicker';

interface FoodCellProps {
  food: FoodType;
}

export const FoodCell: React.FC<FoodCellProps> = ({ food }) => {
  let image = foodPicker(food);
  return (
    <Box w='100%' h='100%' d='flex'>
      {image}
    </Box>
  );
};
