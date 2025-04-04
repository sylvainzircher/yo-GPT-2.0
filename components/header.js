"use client";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import ModelSelector from "./model-selector";
import ModelSettings from "./model-settings";
import ModelUsage from "./model-usage";
import ThemeSwap from "./theme-swap";
import { useSearchParams } from "next/navigation";

export default function Header({ settings, setSettings, gpt }) {
  const searchParams = useSearchParams();
  const chatId = searchParams.get("id") || null;

  return (
    <AnimatePresence>
      <div className="z-50 flex sticky top-0 bg-base-100 py-2 items-center px-2 ml-2 md:px-2 gap-2">
        <motion.div
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 2 }}
        >
          <div className="flex flex-row items-center">
            {chatId?.includes("gpt") || gpt ? (
              ""
            ) : (
              <ModelSelector settings={settings} setSettings={setSettings} />
            )}
            <ModelSettings settings={settings} setSettings={setSettings} />
            <ModelUsage />
            <ThemeSwap />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
