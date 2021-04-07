import { SettingsType } from '../App';
import { SingleLinkedList } from '../utils/SingleLinkedList';

export type FoodType = 'protein' | 'meat' | 'steroid' | 'creatine';

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
  snake: SingleLinkedList<CellData>;
};

export type DataType =
  | 'LOST'
  | 'PLAY_AGAIN'
  | { type: 'SET_SETTINGS'; boardSettings: SettingsType }
  | {
      type: 'MOVE_SNAKE';
      payload: string;
    };
