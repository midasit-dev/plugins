import { motion, AnimatePresence } from "framer-motion";
import type React from "react";
import { useState } from "react";

interface InfoWrapperProps {
  children: React.ReactNode;
  tooltip: React.ReactNode;
}

export default function InfoWrapper({ children, tooltip }: InfoWrapperProps) {
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
            className="absolute bottom-8 left-0 w-auto h-auto rounded-md shadow-md bg-white p-4 flex"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {tooltip}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
