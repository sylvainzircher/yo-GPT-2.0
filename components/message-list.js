import { useRef, useState, useEffect } from "react";
import { useScrollToBottom } from "@/components/use-scroll-to-bottom";
import { AnimatePresence, motion } from "framer-motion";
import { MessageReasoning, Message } from "./message";
import ButtonScrollDown from "./button-auto-scroll";
import { MessageQuickActions } from "./message-quick-actions";
import { useSearchParams } from "next/navigation";
import { getGPTById } from "@/libs/get-gpt-by-id";

export function MessageList({
  messages,
  isLoading,
  isStreaming,
  reload,
  setMessages,
  gpt,
}) {
  const searchParams = useSearchParams();
  const uid = searchParams.get("id") || null;
  const editableDivRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [indexChat, setIndexChat] = useState(0);
  const [messagesContainerRef, messagesEndRef] = useScrollToBottom(
    messages,
    isEditing
  );
  const [retrievedGpt, setRetrievedGpt] = useState([]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    messages[indexChat].content = editableDivRef.current.innerText;
    setMessages(messages);
    reload({ body: { isEdited: true } });
  };

  const cancelEdit = () => {
    // On close reset the inner text based on the right message content
    editableDivRef.current.innerText = messages[indexChat].content;
    setIsEditing(false);
  };

  // If we go to another chat >> close automatically the edit mode
  useEffect(() => {
    setIsEditing(false);
  }, [uid]);

  useEffect(() => {
    const getGpt = async () => {
      if (uid && String(uid).includes("gpt")) {
        const [gptId, chatId] = uid.split("_");
        try {
          const retrievedGpt = await getGPTById(gptId);
          setRetrievedGpt(retrievedGpt);
        } catch (error) {
          console.log(error);
        }
      }
    };
    getGpt();
  }, [uid]);

  return (
    <AnimatePresence>
      <div
        className="flex flex-col min-w-0 gap-6 pt-4 w-2/3 mx-auto"
        ref={messagesContainerRef}
      >
        <div className="flex flex-col">
          {messages.map((m, index) => (
            <div key={index} className="whitespace-pre-wrap">
              {m.role === "user" ? (
                <motion.div
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 2 }}
                >
                  <div className="chat chat-end">
                    {messages.length - 1 === index + 1 ? (
                      <div
                        ref={editableDivRef}
                        className={`bg-base-200 rounded-xl chat-end px-4 py-2 text-md ${
                          isEditing ? "border w-full h-40 overflow-y-auto" : ""
                        }`}
                        contentEditable={isEditing}
                        suppressContentEditableWarning={true}
                      >
                        {m.content}
                      </div>
                    ) : (
                      <div className="bg-base-200 rounded-xl chat-end px-4 py-2 text-md">
                        {m.content}
                      </div>
                    )}
                  </div>
                  <MessageQuickActions
                    message={m}
                    reload={messages.length - 1 === index + 1 ? reload : false}
                    isEditing={isEditing}
                    index={index}
                    setIndexChat={setIndexChat}
                    onClick={isEditing ? handleSave : handleEdit}
                    onCancel={cancelEdit}
                  />
                </motion.div>
              ) : (
                <div>
                  {retrievedGpt.length > 0 ? (
                    <p className="text-sm font-bold pb-3 pt-5 border-b">
                      {retrievedGpt[0].name}
                    </p>
                  ) : (
                    ""
                  )}
                  <div className="chat chat-start py-5 justify-start">
                    <div className="text-md text-left w-full mx-auto">
                      {m.reasoning ? (
                        <MessageReasoning
                          message={m}
                          isLoading={isLoading && messages.length - 1 === index}
                        />
                      ) : (
                        <Message
                          message={m}
                          isLoading={isLoading && messages.length - 1 === index}
                        />
                      )}
                      <MessageQuickActions
                        message={m}
                        messages={messages}
                        setMessages={setMessages}
                        reload={messages.length - 1 === index ? reload : false}
                        isLoading={isLoading && messages.length - 1 === index}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div
                ref={messagesEndRef}
                className="shrink-0 min-w-[24px] min-h-[24px]"
              />
            </div>
          ))}
        </div>
        <ButtonScrollDown endRef={messagesEndRef} isStreaming={isStreaming} />
      </div>
    </AnimatePresence>
  );
}
