import { useEffect, useRef, useState } from 'react';
import { DIRECTION } from '../types/types';
import { getOppositeDirection } from '../utils/snake/snake-coordination';

export const useSnakeMovement = (snakeHeadDirection: DIRECTION) => {
  const [direction, setDirection] = useState<DIRECTION>(snakeHeadDirection);
  const snakeCellsSizeRef = useRef<number>(1);
  const snakeHeadDirectionRef = useRef<DIRECTION>(snakeHeadDirection);

  /* eslint-disable */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      const key = e.key.toLocaleLowerCase();
      if (key === 'a' || key === 'arrowleft') {
        _setDirection(DIRECTION.LEFT);
      } else if (key === 'w' || key === 'arrowup') {
        _setDirection(DIRECTION.UP);
      } else if (key === 's' || key === 'arrowdown') {
        _setDirection(DIRECTION.DOWN);
      } else if (key === 'd' || key === 'arrowright') {
        _setDirection(DIRECTION.RIGHT);
      }
    };

    window.addEventListener('keydown', onKeyDown, true);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  useEffect(() => {
    snakeHeadDirectionRef.current = snakeHeadDirection;
  }, [snakeHeadDirection]);

  //   Validates and sets direction
  const _setDirection = (_direction: DIRECTION, withCheck = true) => {
    // Handles the case where if snake.current length is 2, and snake.current is moving to left, and user decides/misclicks to go opposite -> right, then the game will end and that should not happen
    if (
      snakeCellsSizeRef.current > 1 &&
      _direction === getOppositeDirection(snakeHeadDirectionRef.current) &&
      _direction !== snakeHeadDirectionRef.current &&
      withCheck
    )
      return;

    setDirection(_direction);
  };

  return {
    direction,
    snakeCellsSizeRef,
    setDirection: _setDirection,
  };
};
