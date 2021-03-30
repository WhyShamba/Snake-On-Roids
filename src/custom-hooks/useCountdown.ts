import { useEffect, useRef, useState } from 'react';

export const useCountdown = (
  initialCount: number,
  onCountdownComplete?: () => any
) => {
  const [count, setCount] = useState(initialCount);
  const callBackRef = useRef<typeof onCountdownComplete>();

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
    } else if (callBackRef.current) {
      callBackRef.current();
    }
  }, [count]);

  const resetCount = (count?: number) => setCount(count ? count : initialCount);

  const cancelCountdown = () => setCount(0);

  return {
    count,
    resetCount,
    cancelCountdown,
  };
};
