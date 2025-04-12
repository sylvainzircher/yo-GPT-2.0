"use client";
import { useChat } from "ai/react";
import React, { useState, useEffect } from "react";
import Header from "@/components/header";
import Chat from "@/components/chat";
import Sidebar from "@/components/sidebar";
import MessageInput from "@/components/message-input";
import useSWR from "swr";
import { toast } from "sonner";

export default function chatWithDoc() {
  const [settings, setSettings] = useState({});
  const [isStreaming, setIsStreaming] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);

  const fetcher = (url) => fetch(url).then((res) => res.json());
  const { data } = useSWR("/api/settings/", fetcher);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
    reload,
    stop,
  } = useChat({
    api: "/api/chat-with-doc",
    body: {
      model: settings.model,
      temperature: settings.temperature,
      maxTokens: settings.maxTokens,
      autoTitle: settings.autoTitle,
      autoSave: settings.autoSave,
    },
    onResponse: () => {
      setIsStreaming(true);
    },
    onError: (error) => {
      toast.error(`An error occurred: ${error.message}`);
    },
    onFinish: () => {
      setIsStreaming(false);
    },
  });

  useEffect(() => {
    if (data) {
      setSettings({
        model: data.settings.model,
        temperature: data.settings.temperature,
        maxTokens: data.settings.maxTokens,
        isReasoning: data.settings.model === "deepseek-r1" ? true : false,
        autoSave: data.settings.autoSave,
        autoTitle: data.settings.autoTitle,
      });
    }
  }, [data]);

  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      if (
        typeof args[0] === "string" &&
        args[0].includes("<pre> cannot be a descendant of <p>")
      ) {
        // Suppress the hydration error about <pre> in <p>
        return;
      }
      originalError(...args);
    };
    return () => {
      console.error = originalError;
    };
  }, []);

  return (
    <div className="h-screen flex flex-row">
      <div className="flex flex-col">
        <Sidebar />
      </div>
      <div className="h-screen h-full flex flex-col w-full">
        <div className="overflow-y-scroll" id="scroller">
          <Header settings={settings} setSettings={setSettings} />
          <Chat
            messages={messages}
            isLoading={isLoading}
            isStreaming={isStreaming}
            reload={reload}
            setMessages={setMessages}
          />
        </div>
        <div className="flex flex-row flex-1 items-center bg-base-100 text-sm w-full mx-auto">
          <MessageInput
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            settings={settings}
            isLoading={isLoading}
            chatLoaded={chatStarted}
            messages={messages}
            stop={stop}
            pdf={true}
          />
        </div>
      </div>
    </div>
  );
}
