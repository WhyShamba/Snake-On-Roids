import { MultiplayerSettingsType } from '../App';
import { SingleLinkedList } from '../utils/SingleLinkedList';

export type FoodType = 'protein' | 'meat' | 'steroid' | 'creatine';

export type SnakeType = SingleLinkedList<CellData>;

export type CellData = {
  row: number;
  cell: number;
  value: number;
  direction: DIRECTION;
};

// values are 0, 1, 2, 3
export enum DIRECTION {
  LEFT,
  UP,
  RIGHT,
  DOWN,
}

export type MoveSnakeDataType = {
  cells: [];
  foodCell: {
    value: number;
    food: FoodType;
  };
  snake: SnakeType;
};

export type FoodCell = {
  value: number;
  food: FoodType;
};

export type GameDataType =
  | { type: 'SET_SETTINGS'; boardSettings: MultiplayerSettingsType['settings'] }
  | { type: 'UPDATE_COUNTDOWN'; count: number };

export type DataType =
  | 'PLAY_AGAIN'
  | 'LOST'
  | { type: 'TIME_EXPIRED'; score: number }
  | {
      type: 'MOVE_SNAKE';
      payload: string;
    };

export type DataTypeNew =
  | 'LOST'
  | 'PLAY_AGAIN'
  | { type: 'TIME_EXPIRED'; score: number }
  | {
      type: 'MOVE_SNAKE';
      payload: string;
    };

export type SnakeReducerStateType = {
  board: number[][];
  score: number;
  snake: SnakeType;
  snakeCells: number[];
  initialSnakeSpeed: number;
  // direction: DIRECTION;
  foodCell: FoodCell;
  isGuest: boolean;
  enemy?: Partial<{
    snake: SnakeType;
    snakeCells: number[];
    foodCell: FoodCell;
  }>;
};

export type SnakeReducerActionType =
  | {
      type: 'GENERATE_FOOD_CELL' | 'GAME_OVER';
    }
  | {
      type: 'MOVE_SNAKE';
      newSnakeCells: number[];
      newScore: number;
      foodEaten: FoodType | null;
      sendMoveData?: (cells: number[], foodCell: FoodCell) => void;
    }
  | {
      type: 'PLAY_AGAIN';
      sendInitialSnakePosition?: (foodCell: FoodCell) => void;
    }
  | {
      type: 'SET_ENEMY_INFO';
      enemySnake: SnakeType;
      enemyCells: number[];
      enemyFoodCell: FoodCell;
    }
  | {
      type: 'STEROID_SIDE_EFFECT';
      newSnakeCells: number[];
    };

export type CountReducerType = {
  foodCount: number;
  effectsCount: {
    steroid?: number;
    creatine?: number;
    protein?: number;
    meat?: number;
  };
  currentFoodEffect: 'creatine' | 'steroid' | null;
};

export type CountReducerActionType =
  | {
      type: 'RESET_FOOD_TIMER' | 'GAME_OVER' | 'PLAY_AGAIN';
    }
  | {
      type: 'RESET_SPECIFIC_FOOD_TIMER' | 'CLEAR_SPECIFIC_FOOD_TIMER';
      food: FoodType;
    }
  | {
      type: 'CONSUME_FOOD';
      food: FoodType;
    }
  | {
      type: 'TICK';
    };

export type GameReducerStateType = {
  gameOver: boolean;
  playerWon: boolean;
  multiplayerStats: {
    playAgain: {
      approved: boolean;
      me: boolean;
      friend: boolean;
      loading: boolean;
    };
    scores: {
      scoreMe: number;
      scoreEnemy: number;
    };
  };
};

export type GameReducerActionType =
  | {
      type: 'GAME_OVER' | 'PLAY_AGAIN' | 'ON_PLAYER_WIN' | 'ON_PLAYER_LOSS';
    }
  | {
      type: 'SET_GAME_OVER';
      gameOver: boolean;
    }
  | {
      type: 'PLAY_AGAIN_REQUEST';
      byMe: boolean;
      sendPlayAgainSignal?: () => any;
      notifyPlayer?: () => any;
    };
