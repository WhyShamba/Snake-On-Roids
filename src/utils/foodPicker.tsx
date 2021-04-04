import { Image, ImageProps } from '@chakra-ui/react';
import React from 'react';

export function foodPicker(
  food: string,
  imageStyle: ImageProps = {
    w: '65%',
    h: '65%',
    m: 'auto',
  }
) {
  let image: any;
  switch (food) {
    case 'meat':
      image = <Image src='/img/meat.png' {...imageStyle} />;
      break;
    case 'creatine':
      image = <Image src='/img/creatine.webp' {...imageStyle} />;
      break;
    case 'protein':
      image = <Image src='/img/protein.webp' {...imageStyle} />;
      break;
    default:
      image = <Image src='/img/roid.png' {...imageStyle} />;
      break;
  }
  return image;
}
