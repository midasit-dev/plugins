import { motion, AnimatePresence } from "framer-motion";
import type React from "react";
import { useState } from "react";

interface InfoWrapperProps {
  children: React.ReactNode;
  tooltip: React.ReactNode;
  tooltipProps?: {
    bottom?: string | number;
    left?: string | number;
  };
}

export default function InfoWrapper({
  children,
  tooltip,
  tooltipProps,
}: InfoWrapperProps) {
  const { bottom, left } = tooltipProps ?? {};
  const [isHover, setIsHover] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      {children}

      {isHover && (
        <AnimatePresence>
          <motion.div
            className="absolute w-auto h-auto rounded-md shadow-lg bg-white p-4 flex border border-gray-300 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              bottom: bottom ?? 32,
              left: left ?? 0,
            }}
          >
            {tooltip}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
