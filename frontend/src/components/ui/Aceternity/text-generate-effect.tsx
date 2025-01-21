"use client";

import { useEffect } from "react";
import { motion, stagger, useAnimate } from "framer-motion";
import { cn } from "@/libs/utils";

export const TextGenerateEffect = ({
  words,
  className,
  filter = true,
  duration = 0.5,
}: {
  words: string;
  className?: string;
  filter?: boolean;
  duration?: number;
}) => {
  const [scope, animate] = useAnimate();
  const wordsArray = words.split(" ");

  useEffect(() => {
    animate(
      "span",
      {
        opacity: 1,
        filter: filter ? "blur(0px)" : "none",
      },
      {
        duration: duration,
        delay: stagger(0.2),
      }
    );
  }, [animate, duration, filter]); // Removed scope.current from dependencies

  const renderWords = () => {
    return (
      <motion.div ref={scope} className={cn("", className)}>
        <div className="duration-1000">
          {wordsArray.map((word, idx) => {
            return (
              <motion.span
                key={idx}
                className="opacity-0"
                style={{
                  filter: filter ? "blur(8px)" : "none",
                }}
              >
                {word}{" "}
              </motion.span>
            );
          })}
        </div>
      </motion.div>
    );
  };

  return renderWords();
};
