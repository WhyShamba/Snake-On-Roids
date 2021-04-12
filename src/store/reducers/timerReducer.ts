import produce from 'immer';
import {
  CREATINE_EFFECT_DURATION,
  FOOD_DURATION,
  STEROID_EFFECT_DURATION,
} from '../../consts';
import { CountReducerActionType, CountReducerType } from '../../types/types';

export const initialState: CountReducerType = {
  foodCount: FOOD_DURATION,
  effectsCount: {},
  currentFoodEffect: null,
};

export const initializeTimerReducerInitialState = (
  gameCountDown?: number
): CountReducerType => ({
  foodCount: FOOD_DURATION,
  effectsCount: {},
  currentFoodEffect: null,
  gameCountDown,
});

export const timerReducer = (
  state: CountReducerType,
  action: CountReducerActionType
): typeof state => {
  switch (action.type) {
    case 'TICK':
      const stateAfterTick = produce(state, (draft) => {
        if (draft.foodCount > 0) {
          draft.foodCount -= 1;
        } else {
          // When timer is over
          // action.snakeDispatch({ type: 'GENERATE_FOOD_CELL' });
          draft.foodCount = initialState.foodCount;
        }

        // Creatine
        if (draft.effectsCount.creatine !== undefined) {
          if (draft.effectsCount.creatine > 0) {
            draft.effectsCount.creatine -= 1;
          } else {
            draft.effectsCount.creatine = undefined;
            if (draft.currentFoodEffect === 'creatine') {
              draft.currentFoodEffect = null;
            }
          }
        }

        // Steroid
        if (draft.effectsCount.steroid !== undefined) {
          if (draft.effectsCount.steroid > 0) {
            draft.effectsCount.steroid -= 1;
          } else {
            draft.effectsCount.steroid = undefined;
            draft.currentFoodEffect =
              draft.effectsCount.creatine! > 0 ? 'creatine' : null;
          }
        }

        // Game countdown
        if (draft.gameCountDown !== undefined) {
          if (draft.gameCountDown > 0) {
            draft.gameCountDown -= 1;
          } else {
            draft.gameCountDown = undefined;
          }
        }
      });

      return stateAfterTick;

    case 'RESET_FOOD_TIMER':
      return {
        ...state,
        foodCount: FOOD_DURATION,
      };

    case 'RESET_GAME_COUNTDOWN':
      return {
        ...state,
        gameCountDown: state.gameCountDown,
      };

    case 'GAME_OVER':
      return {
        ...initialState,
      };

    case 'PLAY_AGAIN':
      return {
        ...initialState,
        gameCountDown: action.gameCountDown,
      };

    case 'RESET_SPECIFIC_FOOD_TIMER':
      const newStateAfterReset = produce(state, (draft) => {
        switch (action.food) {
          case 'creatine':
            draft.effectsCount.creatine = CREATINE_EFFECT_DURATION;
            break;
          case 'steroid':
            draft.effectsCount.steroid = STEROID_EFFECT_DURATION;
            break;
          default:
            // meat and protein
            draft.effectsCount[action.food] = Infinity;
            break;
        }
      });
      return newStateAfterReset;

    case 'CONSUME_FOOD':
      const newStateAfterConsumptoin = produce(state, (draft) => {
        switch (action.food) {
          case 'creatine':
            draft.effectsCount.creatine = CREATINE_EFFECT_DURATION;

            // If not under the effect of steroid
            if (draft.currentFoodEffect !== 'steroid') {
              draft.currentFoodEffect = 'creatine';
            }
            break;
          case 'steroid':
            draft.effectsCount.steroid = STEROID_EFFECT_DURATION;
            draft.currentFoodEffect = 'steroid';
            break;
          default:
            // meat and protein
            draft.effectsCount[action.food] = Infinity;
            break;
        }
        // also reset the main food timer
        draft.foodCount = initialState.foodCount;
      });
      return newStateAfterConsumptoin;

    default:
      return state;
  }
};
