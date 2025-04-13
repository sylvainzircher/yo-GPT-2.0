"use client";
import { MessageList } from "@/components/message-list";

export default function Chat({
  messages,
  isReasoning,
  isLoading,
  isStreaming,
  reload,
  setMessages,
  gpt,
  pdf,
}) {
  return (
    <div className="w-full flex flex-col">
      <MessageList
        messages={messages}
        isReasoning={isReasoning}
        isLoading={isLoading}
        isStreaming={isStreaming}
        reload={reload}
        setMessages={setMessages}
        gpt={gpt}
        pdf={pdf}
      />
    </div>
  );
}
