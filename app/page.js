"use client";
import { useChat } from "ai/react";
import React, { useState, useEffect } from "react";
import Header from "@/components/header";
import Chat from "@/components/chat";
import Sidebar from "@/components/sidebar";
import MessageInput from "@/components/message-input";
import { getMessagesById } from "@/libs/get-messages-by-id";
import { useSearchParams } from "next/navigation";
import useSWR, { useSWRConfig } from "swr";
import { toast } from "sonner";

export default function Home() {
  const [settings, setSettings] = useState({});
  const [isStreaming, setIsStreaming] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [chatUid, setChatUid] = useState();
  const searchParams = useSearchParams();
  const chatId = searchParams.get("id") || null;
  const { mutate } = useSWRConfig();

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
    body: {
      model: settings.model,
      temperature: settings.temperature,
      maxTokens: settings.maxTokens,
      uid: chatId ? chatId : chatUid,
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
      mutate("/api/get-chats/");
      setIsStreaming(false);
    },
  });

  const handleSubmitModified = (e) => {
    e.preventDefault();
    if (!chatStarted) {
      setChatUid(crypto.randomUUID());
    }
    setChatStarted(true);
    handleSubmit(e);
  };

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
    const getChatsById = async (chatId) => {
      if (chatId) {
        const chatRetrieved = await getMessagesById(String(chatId));
        setMessages(chatRetrieved);
        setChatStarted(true);
      }
    };
    getChatsById(chatId);
  }, [chatId]);

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

  useEffect(() => {
    mutate(`/api/get-usage-by-id/${chatId ? chatId : chatUid}`);
  }, [isStreaming]);

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
            handleSubmit={handleSubmitModified}
            settings={settings}
            isLoading={isLoading}
            chatLoaded={chatStarted}
            uid={chatId ? chatId : chatUid}
            messages={messages}
            stop={stop}
          />
        </div>
      </div>
    </div>
  );
}
