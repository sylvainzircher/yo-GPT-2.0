"use client";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import NewConversation from "./new-conversation";
import ModelImageSettings from "./model-image-settings";
import ModelUsage from "@/components/model-imagegen-usage";
import ThemeSwap from "./theme-swap";
import { useSearchParams } from "next/navigation";

export default function HeaderImageGeneration({ settings, setSettings }) {
  const searchParams = useSearchParams();

  return (
    <AnimatePresence>
      <div className="z-50 flex sticky top-0 bg-base-100 p-3 mb-10 mx-auto">
        <motion.div
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 2 }}
        >
          <div className="flex flex-row">
            <NewConversation />
            <ModelImageSettings settings={settings} setSettings={setSettings} />
            <ModelUsage />
            <ThemeSwap />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
