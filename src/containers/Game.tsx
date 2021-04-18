/* eslint-disable react-hooks/exhaustive-deps */
import { useDisclosure, useToast } from '@chakra-ui/react';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { AvatarBar } from '../components/AvatarBar';
import Board from '../components/Board';
import { Controller } from '../components/Controller';
import { GameOverModal } from '../components/GameOverModal';
import { MainContext } from '../context';
import { useCountdownInfinete } from '../custom-hooks/useCountdown';
import { useSetInterval } from '../custom-hooks/useSetInterval';
import { useSnakeMovementImproved } from '../custom-hooks/useSnakeMovement';
import { mainReducer } from '../store/reducers/snakeReducer';
import {
  initializeTimerReducerInitialState,
  timerReducer,
} from '../store/reducers/timerReducer';
import { DIRECTION, FoodType, SnakeReducerActionType } from '../types/types';
import { createValidUsername } from '../utils/createValidUsername';
import { createLeaderboard } from '../utils/firebase-operations/createLeaderboard';
import { generateRandomNum } from '../utils/generateRandomNum';
import { isOutOfBounds } from '../utils/isOutOfBounds';
import { Node, SingleLinkedList } from '../utils/SingleLinkedList';
import {
  getFoodCell,
  getFoodType,
  getInitialSnakeCell,
  getInitialSnakeProperties,
} from '../utils/snake/initializers';
import { getNextNodeForDirection } from '../utils/snake/snake-coordination';
import {
  growSnake,
  removeCells,
  reverseSnake,
} from '../utils/snake/snakeManipulationMethods';

const Game = () => {
  // Global game settings
  const {
    togglePlayGame,
    snakeSpeed: initialSnakeSpeed,
    disableController,
    board,
    highestScore,
    user,
    userLoading,
    setHighestScore,
    gameType,
  } = useContext(MainContext);
  const [timerState, timerDispatch] = useReducer(
    timerReducer,
    initializeTimerReducerInitialState(initialSnakeSpeed)
  );
  const [snakeState, snakeDispatch] = useReducer(mainReducer, {
    ...getInitialSnakeProperties(board, false, false),
    foodCell: {
      value: getFoodCell(board),
      food: getFoodType(),
    },
    board,
    initialSnakeSpeed,
    isGuest: false,
    score: 0,
  });
  const snakeRef = useRef(
    new SingleLinkedList(new Node(getInitialSnakeCell(board)))
  );
  const snakeCellsToBeRemoved = useRef<number[]>(); // Helps with snake reducer state collision (when multiple dispatches are done at once)
  const { direction, setDirection } = useSnakeMovementImproved(
    snakeRef.current.head!.data!.direction,
    snakeState.snakeCells.length
  );
  // Game over modal
  const {
    isOpen: gameOver,
    onOpen: openModal,
    onClose: closeModal,
  } = useDisclosure();
  const [newHighScore, setNewHighScore] = useState(false);
  const toast = useToast();

  useSetInterval(() => {
    if (!gameOver) onMove();
  }, timerState.snakeSpeed);

  const { startTicks, stopTicks } = useCountdownInfinete(
    () =>
      timerDispatch({
        type: 'TICK',
      }),
    true
  );

  useEffect(() => {
    if (gameOver) {
      stopTicks();
    } else {
      startTicks();
    }
  }, [gameOver]);

  // Handle timer
  useEffect(() => {
    const foodDuration = timerState.foodCount;
    const { creatine, steroid } = timerState.effectsCount;

    if (foodDuration === 0 && !gameOver) {
      // generateFoodCell();
      snakeDispatch({ type: 'GENERATE_FOOD_CELL' });
    }

    if (creatine === 0) {
      onCreatineEffectOver();
    }

    if (steroid === 0) {
      onSteroidEffectOver();
    }
  }, [timerState.foodCount, timerState.effectsCount]);

  // const snake = snakeRef.current;

  const onMove = () => {
    if (!isOutOfBounds(direction, snakeRef.current, board)) {
      const newNode = getNextNodeForDirection(
        snakeRef.current.head!,
        direction,
        board
      );

      // If it's not colliding
      if (!snakeState.snakeCells.includes(newNode.data!.value)) {
        // remove tail
        let newSnakeCells = snakeState.snakeCells.filter((cellValue) => {
          if (cellValue === snakeRef.current.tail?.data.value) return false;
          if (
            snakeCellsToBeRemoved.current &&
            snakeCellsToBeRemoved.current.includes(cellValue)
          )
            return false;
          return true;
        });
        snakeCellsToBeRemoved.current = undefined;

        // add new head
        newSnakeCells.push(newNode.data.value);

        // fix links in snakeRef.current
        snakeRef.current.moveList(newNode);

        const foodConsumed = newNode.data.value === snakeState.foodCell.value;
        if (foodConsumed) {
          // Consume food
          snakeDispatch(onFoodConsumption(newSnakeCells));
          return;
        }
        snakeDispatch({
          type: 'MOVE_SNAKE',
          newSnakeCells,
          newScore: newSnakeCells.length - 1,
          foodEaten: null,
        });
      } else {
        gameOverHandler();
      }
    } else {
      gameOverHandler();
    }
  };

  const onFoodConsumption = (
    newSnakeCells: number[]
  ): SnakeReducerActionType => {
    let foodEaten: FoodType | null = null;

    // Consume food
    if (
      snakeState.foodCell.food === 'protein' ||
      snakeState.foodCell.food === 'meat'
    ) {
      newSnakeCells = growSnake(snakeRef.current, board, newSnakeCells);
    } else if (snakeState.foodCell.food === 'creatine') {
      newSnakeCells = growSnake(snakeRef.current, board, newSnakeCells);

      // Add the effects
      if (timerState.currentFoodEffect !== 'steroid') {
        reverseSnake(snakeRef.current);

        setDirection(snakeRef.current.head?.data.direction!, false);
      }
    } else if (snakeState.foodCell.food === 'steroid') {
      for (let index = 0; index < 2; index++) {
        newSnakeCells = growSnake(snakeRef.current, board, newSnakeCells);
      }
    }
    foodEaten = snakeState.foodCell.food;

    //   Reset timer for that food and global timer since food was confused
    timerDispatch({
      type: 'CONSUME_FOOD',
      food: snakeState.foodCell.food,
    });

    return {
      type: 'MOVE_SNAKE',
      foodEaten,
      newSnakeCells,
      newScore: newSnakeCells.length - 1,
    };
  };

  // Firebase submit highscore
  const submitHighScore = async (username: string) => {
    if (user) {
      const res = await createLeaderboard(user.displayName!, {
        game: { [gameType]: snakeState.score },
        name: createValidUsername(username),
      });

      toast({
        title: res
          ? 'Successfully submitted your new high score'
          : 'There was a problem while submitting your highscore, try at later time!',
        position: 'top',
        status: res ? 'success' : 'error',
        isClosable: true,
        duration: 2000,
      });
    }
  };

  // Game over and play again methods
  function gameOverHandler() {
    // Turn off effects
    timerDispatch({ type: 'GAME_OVER' });

    // Set highest score locally
    if (snakeState.score > highestScore[gameType]) {
      setNewHighScore(true);
      setHighestScore({ [gameType]: snakeState.score });
    }

    openModal();
  }

  // Reset the game to initial state
  const playAgain = () => {
    setNewHighScore(false);
    snakeRef.current = new SingleLinkedList(
      new Node(getInitialSnakeCell(board))
    );

    timerDispatch({ type: 'PLAY_AGAIN' });
    snakeDispatch({ type: 'PLAY_AGAIN' });

    setDirection(generateRandomNum(0, 3));

    closeModal();
  };

  return (
    <>
      <AvatarBar
        effects={timerState.effectsCount}
        score={snakeState.score}
        untilNextFood={timerState.foodCount}
      />
      <Board
        board={board}
        foodCell={snakeState.foodCell}
        snakeCells={snakeState.snakeCells}
        snakeRef={snakeRef}
        snakeCellsToBeRemoved={snakeCellsToBeRemoved.current}
      />
      <Controller
        changeDirection={useCallback(
          (_direction: DIRECTION) => setDirection(_direction),
          []
        )}
        currentDirection={direction}
        disable={disableController}
      />
      {useMemo(
        () => (
          <GameOverModal
            isOpen={gameOver}
            onClose={closeModal}
            score={snakeState.score}
            onPlayAgain={playAgain}
            onMenuClick={togglePlayGame}
            highestScore={highestScore[gameType]}
            user={user}
            authLoading={userLoading}
            onSubmit={() => setNewHighScore(false)}
            newHighScore={newHighScore}
            submitHighScore={submitHighScore}
          />
        ),
        [gameOver, newHighScore]
      )}
    </>
  );

  // Side effects that can happen
  function onCreatineEffectOver() {
    if (timerState.currentFoodEffect !== 'steroid' && !gameOver) {
      // Side effects for creatine
      reverseSnake(snakeRef.current);
      setDirection(snakeRef.current.head!.data.direction, false);
    }
  }

  function onSteroidEffectOver() {
    if (!gameOver) {
      if (snakeState.snakeCells.length > 1) {
        const [, removedSnakeCells] = removeCells(
          snakeState.snakeCells,
          snakeRef.current,
          3
        );
        snakeRef.current.print();
        snakeCellsToBeRemoved.current = removedSnakeCells;
      }
    }
  }
};

export default Game;
