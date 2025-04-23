"use client";
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChartLine } from "lucide-react";
import UsageTrend from "@/components/analytics-imagegen";

export default function ModelUsage() {
  const [showDashboard, setShowDashboard] = useState(false);
  const dashboardImageUsageRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dashboardImageUsageRef.current &&
        !dashboardImageUsageRef.current.contains(event.target)
      ) {
        setShowDashboard(false);
      }
    }
    if (showDashboard) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDashboard]);

  const toggleShowDashboard = () => {
    setShowDashboard(!showDashboard);
  };

  return (
    <div ref={dashboardImageUsageRef}>
      <button
        className={`btn btn-square text-sm flex flex-row align-middle p-2 items-center ml-2 ${
          showDashboard ? "border border-neutral" : ""
        }`}
        onClick={toggleShowDashboard}
      >
        <ChartLine className="ml-1" size={16} />
      </button>
      {showDashboard && (
        <AnimatePresence>
          <motion.div
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 2 }}
          >
            <div className="card bg-base-100 shadow-xl border border-neutral-content overflow-y-auto fixed top-20 right-50 w-1/2">
              <UsageTrend />
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
