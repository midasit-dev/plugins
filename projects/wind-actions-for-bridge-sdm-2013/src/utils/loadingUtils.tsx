import { Icon } from "@midasit-dev/moaui";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

export function useDelayCallback() {
  const [isPending, setIsPending] = useState<boolean>(false);

  const delayCallback = useCallback(
    (callback?: () => void, ms: number = 500) => {
      setIsPending(true);

      setTimeout(() => {
        try {
          if (callback) {
            callback();
          }
        } catch (error) {
          console.error(error);
        } finally {
          setIsPending(false);
        }
      }, ms);
    },
    [setIsPending]
  );

  return {
    delayCallback,
    isPending,
  };
}

export function DoneBanner({ isVisible }: { isVisible: boolean }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1.2 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="flex items-center text-[#0867EC] size-3"
        >
          <Icon iconName="Done" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function useChangeBanner(value: any, ms: number = 500) {
  const [memoValue, setMemoValue] = useState<any>(value);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  // value가 변경될 때마다 isVisible을 true로 변경
  useEffect(() => {
    if (value !== memoValue) {
      setIsVisible(true);
      setMemoValue(value);
    }
  }, [value, memoValue]);

  // isVisible이 true일 때 0.5초 후에 false로 변경 (초기 세팅)
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), ms);
    return () => clearTimeout(timer);
  }, [ms, value]);

  return {
    isVisible,
  };
}
