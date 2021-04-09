import { useEffect, useRef, useState } from 'react';

export const useCountdown = (
  initialCount: number,
  startImmedietly: boolean = true,
  onCountdownComplete?: () => any
) => {
  const [count, setCount] = useState(startImmedietly ? initialCount : 0);
  const callBackRef = useRef<typeof onCountdownComplete>();
  const startRef = useRef(startImmedietly);

  useEffect(() => {
    callBackRef.current = onCountdownComplete;
  }, [onCountdownComplete]);

  useEffect(() => {
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
  }, [count]);

  const resetCount = (count?: number) => {
    startRef.current = true;
    setCount(count ? count : initialCount);
  };

  const cancelCountdown = () => setCount(0);

  return {
    count,
    resetCount,
    startCount: resetCount, // same as reset count but with diff naming convention
    cancelCountdown,
  };
};
