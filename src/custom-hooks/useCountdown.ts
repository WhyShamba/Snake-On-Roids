import { useEffect, useRef, useState } from 'react';

export const useCountdown = (
  initialCount: number,
  startImmedietly: boolean = true,
  onCountdownComplete?: () => any
) => {
  const [count, setCount] = useState(startImmedietly ? initialCount : 0);
  const callBackRef = useRef<typeof onCountdownComplete>();
  const startRef = useRef(startImmedietly);
  const manualCountEnabled = useRef(false);

  useEffect(() => {
    callBackRef.current = onCountdownComplete;
  }, [onCountdownComplete]);

  useEffect(() => {
    if (manualCountEnabled.current) {
      if (count === 0 && callBackRef.current) {
        callBackRef.current();
      }
    } else {
      if (count > 0) {
        const interval = setInterval(() => {
          setCount(count - 1);
        }, 1000);

        return () => {
          clearInterval(interval);
        };
      } else if (callBackRef.current && startRef.current) {
        callBackRef.current();
      }
    }
  }, [count]);

  const resetCount = (count?: number) => {
    startRef.current = true;
    manualCountEnabled.current = false;
    setCount(count ? count : initialCount);
  };

  const _setCount = (_count: number) => {
    manualCountEnabled.current = true;
    setCount(_count);
  };

  const cancelCountdown = () => setCount(0);

  return {
    count,
    resetCount,
    startCount: resetCount, // same as reset count but with diff naming convention
    cancelCountdown,
    setCount: _setCount,
  };
};

export const useCountdownInfinete = (
  onTick: (...args: any) => any,
  startImmedietly: boolean = true
) => {
  const callBackRef = useRef<typeof onTick>();
  const [start, setStart] = useState(startImmedietly);

  useEffect(() => {
    callBackRef.current = onTick;
  }, [onTick]);

  useEffect(() => {
    if (start) {
      const interval = setInterval(() => {
        if (callBackRef.current) callBackRef.current();
      }, 1000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [start]);

  const startTicks = (count?: number) => {
    setStart(true);
  };

  const stopTicks = () => {
    setStart(false);
  };

  return {
    startTicks,
    stopTicks,
  };
};
