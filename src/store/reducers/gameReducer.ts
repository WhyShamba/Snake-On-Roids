import produce from 'immer';
import { GameReducerActionType, GameReducerStateType } from '../../types/types';

export const gameStoreInitialState = {
  multiplayerStats: {
    playAgain: {
      approved: false,
      me: false,
      friend: false,
      loading: false,
    },
    scores: {
      scoreMe: 0,
      scoreEnemy: 0,
    },
  },
  gameOver: true,
  playerWon: false,
};

export const gameReducer = (
  state: GameReducerStateType = gameStoreInitialState,
  action: GameReducerActionType
) =>
  produce(state, (draft) => {
    switch (action.type) {
      case 'SET_GAME_OVER':
        draft.gameOver = action.gameOver;
        break;

      case 'GAME_OVER':
        draft.gameOver = true;
        draft.multiplayerStats.playAgain.me = false;
        draft.multiplayerStats.playAgain.friend = false;
        draft.multiplayerStats.playAgain.approved = false;

        break;

      case 'PLAY_AGAIN_REQUEST':
        if (action.byMe) {
          draft.multiplayerStats.playAgain.loading = true;
          draft.multiplayerStats.playAgain.me = true;

          // Notify other peer
          action.sendPlayAgainSignal!();
        } else {
          draft.multiplayerStats.playAgain.friend = true;

          // Notify current peer
          // action.notifyPlayer!();
        }

        if (
          draft.multiplayerStats.playAgain.me &&
          draft.multiplayerStats.playAgain.friend
        )
          draft.multiplayerStats.playAgain.approved = true;
        break;

      case 'PLAY_AGAIN':
        // If both players agree to play
        if (state.multiplayerStats.playAgain.approved) {
          draft.playerWon = false;
          draft.gameOver = false;

          // Reset states
          draft.multiplayerStats.playAgain.me = false;
          draft.multiplayerStats.playAgain.friend = false;
          draft.multiplayerStats.playAgain.approved = false;
          draft.multiplayerStats.playAgain.loading = false;
        }
        break;
      case 'ON_PLAYER_LOSS':
        draft.gameOver = true;
        draft.playerWon = false;
        draft.multiplayerStats.scores.scoreEnemy += 1;
        break;
      case 'ON_PLAYER_WIN':
        draft.gameOver = true;
        draft.playerWon = true;
        draft.multiplayerStats.scores.scoreMe += 1;
        break;
      case 'ON_PLAYER_DRAW':
        draft.gameOver = true;
        draft.playerWon = 'draw';
        break;

      default:
        return state;
    }
  });
