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
  gameOver: false,
  playerWon: false,
};

export const gameReducer = (
  state: GameReducerStateType = gameStoreInitialState,
  action: GameReducerActionType
) =>
  produce(state, (draft) => {
    switch (action.type) {
      case 'TOGGLE_GAME_OVER':
        draft.gameOver = !state.gameOver;
        break;

      case 'GAME_OVER':
        draft.gameOver = true;
        draft.multiplayerStats.playAgain.me = false;
        draft.multiplayerStats.playAgain.friend = false;
        draft.multiplayerStats.playAgain.approved = false;

        break;
      // TODO: add useEffect on playAgain.approved if true dispatch PLAY_AGAIN
      case 'PLAY_AGAIN_REQUEST':
        draft.multiplayerStats.playAgain.loading = true;
        if (action.byMe) {
          draft.multiplayerStats.playAgain.me = true;
        } else {
          draft.multiplayerStats.playAgain.friend = true;
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

          // Reset states
          draft.multiplayerStats.playAgain.me = false;
          draft.multiplayerStats.playAgain.friend = false;
          draft.multiplayerStats.playAgain.approved = false;
          draft.multiplayerStats.playAgain.loading = false;
        }
        break;
      case 'ON_PLAYER_LOSS':
        draft.playerWon = false;
        draft.multiplayerStats.scores.scoreEnemy += 1;
        break;
      case 'ON_PLAYER_WIN':
        draft.playerWon = true;
        draft.multiplayerStats.scores.scoreMe += 1;
        break;

      default:
        return state;
    }
  });
