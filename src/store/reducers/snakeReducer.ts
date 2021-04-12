import produce from 'immer';
import {
  SnakeReducerActionType,
  SnakeReducerStateType,
} from '../../types/types';
import { getFoodCell, getFoodType } from '../../utils/snake/initializers';
import { generateFoodCell } from '../../utils/snake/snakeManipulationMethods';

// TODO: handle set direction and checkup maybe, and enemy set cells
export const mainReducer = (
  state: SnakeReducerStateType,
  action: SnakeReducerActionType
): typeof state => {
  switch (action.type) {
    case 'SET_ENEMY_INFO':
      return {
        ...state,
        enemy: {
          foodCell: action.enemyFoodCell,
          snake: action.enemySnake,
          snakeCells: action.enemyCells,
        },
      };

    case 'MOVE_SNAKE':
      const newState = produce(state, (draft) => {
        draft.score = action.newScore;
        draft.snakeCells = action.newSnakeCells;

        if (action.foodEaten) {
          draft.foodCell = generateFoodCell(
            draft.foodCell,
            draft.board,
            draft.snakeCells
          );
        }
      });

      action.sendMoveData &&
        action.sendMoveData(newState.snakeCells, newState.foodCell);

      return newState;

    case 'GENERATE_FOOD_CELL':
      return {
        ...state,
        foodCell: generateFoodCell(
          state.foodCell,
          state.board,
          state.snakeCells
        ),
      };

    case 'STEROID_SIDE_EFFECT':
      return {
        ...state,
        snakeCells: action.newSnakeCells,
      };
    case 'GAME_OVER':
      break;

    case 'PLAY_AGAIN':
      const stateAfterRefresh = produce(state, (draft) => {
        // Clear enemy info
        draft.enemy = undefined;

        draft.snakeCells = [draft.snake.head?.data.value!];

        draft.score = 0;

        draft.foodCell = {
          value: getFoodCell(state.board),
          food: getFoodType(),
        };
      });

      // Give the initial pos to enemy peer
      if (action.sendInitialSnakePosition) {
        action.sendInitialSnakePosition(stateAfterRefresh.foodCell);
      }

      return stateAfterRefresh;

    default:
      return state;
  }
  return state;
};
