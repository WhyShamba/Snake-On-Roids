import { Box, BoxProps } from '@chakra-ui/react';
import React from 'react';
import { FoodType } from '../../types/types';
import { foodPicker } from '../../utils/foodPicker';

interface FoodCellProps extends BoxProps {
  food: FoodType;
}

export const FoodCell: React.FC<FoodCellProps> = ({ food, ...rest }) => {
  let image = foodPicker(food);
  return (
    <Box w='100%' h='100%' d='flex' {...rest}>
      {image}
    </Box>
  );
};
