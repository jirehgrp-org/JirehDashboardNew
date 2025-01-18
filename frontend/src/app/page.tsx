"use client";

import { motion } from "framer-motion";
import React from "react";
import { useRouter } from "next/navigation";
import { TypewriterEffectSmooth } from "@/components/ui/Aceternity/typewriter-effect";
import { AuroraBackground } from "@/components/ui/Aceternity/aurora-background";
import { useLanguage } from "@/components/context/LanguageContext";
import { translations } from "@/translations";
import Header from "@/components/common/Header";

const Home = () => {
  const { language } = useLanguage();
  const t = translations[language].home;
  const router = useRouter();

  const words = [
    { text: t.words.modern },
    { text: t.words.dashboard },
    { text: t.words.forYourBusinessFrom },
    { text: t.words.jireh, className: "text-purple-500 dark:text-purple-500" },
  ];

  return (
    <AuroraBackground>
      <Header />
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative flex flex-col gap-4 items-center justify-center min-h-screen px-4"
      >
        <div className="text-3xl md:text-7xl font-bold text-slate-900 dark:text-white text-center">
          {t.welcome}
        </div>
        <div className="font-extralight text-base md:text-1xl text-slate-800 dark:text-neutral-200 py-4">
          <TypewriterEffectSmooth words={words} />
        </div>
        <button
          onClick={() => router.push("/auth/login")}
          className="bg-slate-900 dark:bg-white rounded-full w-fit text-white dark:text-slate-900 px-6 py-3 hover:opacity-90 transition-all"
        >
          {t.getStarted}
        </button>
      </motion.div>
    </AuroraBackground>
  );
};

export default Home;
