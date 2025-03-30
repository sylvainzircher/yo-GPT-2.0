"use client";
import React, { useState, useEffect } from "react";
import { PanelRightDashed, Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { isToday, isYesterday, subWeeks } from "date-fns";
import ButtonSidebarChat from "@/components/button-sidebar-chat";
import ButtonSidebarGPT from "./button-sidebar-gpt";
import CustomGptBuilder from "./custom-gpt-builder";
import useSWR from "swr";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [today, setToday] = useState([]);
  const [yesterday, setYesterday] = useState([]);
  const [lastWeek, setLastWeek] = useState([]);
  const [moreThanWeek, setMoreThanWeek] = useState([]);
  const [myGPTs, setMyGPTs] = useState([]);

  const fetcher = (...args) => fetch(...args).then((res) => res.json());

  const { data: chats } = useSWR("/api/get-chats/", fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  const { data: gpts } = useSWR("/api/get-gpts/", fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  const handleClick = () => {
    window.location.href = "/";
  };

  const groupChatsByDate = (chats) => {
    let today = [];
    let yesterday = [];
    let lastWeek = [];
    let moreThanWeek = [];
    const now = new Date();
    const oneWeekAgo = subWeeks(now, 1);
    chats.map((chat) => {
      const chatDate = new Date(chat.timestamp);
      if (isToday(chatDate)) {
        today.push(chat);
      } else if (isYesterday(chatDate)) {
        yesterday.push(chat);
      } else if (chatDate > oneWeekAgo) {
        lastWeek.push(chat);
      } else {
        moreThanWeek.push(chat);
      }
    });

    setToday(today);
    setYesterday(yesterday);
    setLastWeek(lastWeek);
    setMoreThanWeek(moreThanWeek);
  };

  useEffect(() => {
    if (chats) {
      groupChatsByDate(chats);
    }
  }, [chats]);

  useEffect(() => {
    if (gpts) {
      setMyGPTs(gpts);
    }
  }, [gpts]);

  return (
    <AnimatePresence>
      <motion.div
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 2 }}
      >
        {isOpen && (
          <aside className="h-screen flex flex-col w-72 bg-base-200 overflow-y-auto">
            <div className="flex justify-between items-center p-2 sticky top-0 z-30">
              <button
                className="btn btn-square btn-ghost"
                onClick={() => setIsOpen(!isOpen)}
              >
                <PanelRightDashed size={16} />
              </button>
              <div className="flex flex-row items-center">
                <CustomGptBuilder />
                <button
                  className="btn btn-square btn-ghost"
                  onClick={handleClick}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
            <div className="m-5 overflow-y-auto h-full">
              {gpts?.length > 0 && (
                <div className="mb-4 ">
                  <p className="text-md font-bold mb-1">Your custom GPTs</p>
                  {gpts.map((gpt, index) => (
                    <div key={index}>
                      <ButtonSidebarGPT gpt={gpt} />
                    </div>
                  ))}
                </div>
              )}
              {chats && (
                <div>
                  {today.length > 0 && (
                    <p className="text-md font-bold">Today</p>
                  )}
                  {today.map((c, index) => (
                    <div key={index} id={c.id} className="mb-1 mt-1">
                      <ButtonSidebarChat c={c} />
                    </div>
                  ))}
                  {yesterday.length > 0 && (
                    <p className="text-md font-bold mt-4">Yesterday</p>
                  )}
                  {yesterday.map((c, index) => (
                    <div key={index} id={c.id} className="mb-1 mt-1">
                      <ButtonSidebarChat c={c} />
                    </div>
                  ))}
                  {lastWeek.length > 0 && (
                    <p className="text-md font-bold mt-4">Previous 7 days</p>
                  )}
                  {lastWeek.map((c, index) => (
                    <div key={index} id={c.id} className="mb-1 mt-1">
                      <ButtonSidebarChat c={c} />
                    </div>
                  ))}
                  {moreThanWeek.length > 0 && (
                    <p className="text-md font-bold mt-4">
                      More than a week ago
                    </p>
                  )}
                  {moreThanWeek.map((c, index) => (
                    <div key={index} id={c.id} className="mb-1 mt-1">
                      <ButtonSidebarChat c={c} />
                    </div>
                  ))}
                </div>
              )}
              {chats?.length < 1 && (
                <p className="w-full pl-2 pr-2 text-xs">
                  Your conversations will appear here once you start chatting!
                </p>
              )}
            </div>
          </aside>
        )}
        {!isOpen && (
          <aside className="h-screen flex flex-col overflow-y-auto">
            <div className="flex justify-between items-center p-2 sticky top-0 z-30">
              <button
                className="btn btn-square btn-ghost"
                onClick={() => setIsOpen(!isOpen)}
              >
                <PanelRightDashed size={16} />
              </button>
              <div className="flex flex-row items-center">
                <CustomGptBuilder />
                <button
                  className="btn btn-square btn-ghost"
                  onClick={handleClick}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </aside>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default Sidebar;
