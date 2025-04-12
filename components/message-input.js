import { useRef, useState, useEffect } from "react";
import {
  BotMessageSquare,
  ThermometerSun,
  BookOpenText,
  Gauge,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import ButtonChat from "./button-chat";
import ButtonSaveChat from "./button-save-chat";
import ButtonStopChat from "./button-stop-chat";
import useSWR, { useSWRConfig } from "swr";
import { saveMessageManually } from "@/libs/save-messages-manually";
import { toast } from "sonner";

export default function MessageInput({
  input,
  handleInputChange,
  handleSubmit,
  settings,
  isLoading,
  chatLoaded,
  uid,
  messages,
  stop,
  gpt,
  pdf,
}) {
  const inputAreaRef = useRef(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [totalUsageTk, setTotalUsageTk] = useState(0);
  const [totalUsageAmount, setTotalUsageAmount] = useState(0);
  const [gptRetrieved, setGptRetrieved] = useState([]);
  const { mutate } = useSWRConfig();
  const [files, setFiles] = useState(undefined);
  const fileInputRef = useRef(null);

  const fetcher = (url) => fetch(url).then((res) => res.json());

  const { data: usage } = useSWR(
    uid?.includes("gpt")
      ? `/api/get-usage-by-id/${uid}` // Existing Custom Conversation
      : gpt
      ? `/api/get-usage-by-id/${gpt[0].id + "_" + uid}` // New Custom Conversation
      : `/api/get-usage-by-id/${uid}`, // Non custom Conversation
    fetcher
  );

  const { data: gptById } = useSWR(
    gpt
      ? `/api/get-gpt-by-id/${gpt[0].id}` // New Message
      : uid && uid.includes("gpt")
      ? `/api/get-gpt-by-id/${uid.split("_")[0]}` // Existing Message
      : null,
    fetcher
  );

  useEffect(() => {
    // Update GPT on New Message or Existing Conversation
    if (gptById) {
      setGptRetrieved(gptById);
    } else if (gpt) {
      setGptRetrieved(gpt);
    }

    // Update hasStarted when convo id exist
    if (uid) {
      setHasStarted(chatLoaded);
    }

    // Update total usage if uid and usage exist
    if (uid && usage) {
      setTotalUsageTk(usage[0].totalTokens);
      setTotalUsageAmount(usage[1].totalTokensAmount);
    }
  }, [gpt, gptById, chatLoaded, uid, usage]);

  const handleKeyDown = async (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleFormSubmit(e);
      setHasStarted(true);
    }
  };

  const handleFormSubmit = (event) => {
    if (pdf) {
      handleSubmit(event, {
        experimental_attachments: files,
      });

      setFiles(undefined);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } else {
      handleSubmit(event);
    }
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  return (
    <AnimatePresence>
      <div
        className={`${
          hasStarted
            ? "flex flex-col items-center text-center self-end bg-base-100 text-sm w-full pt-4 pb-4"
            : "flex flex-col items-center text-center bg-base-100 text-sm w-full pt-4 pb-4"
        }`}
      >
        {!hasStarted && (
          <motion.div
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: -20 }}
            exit={{ opacity: 0, y: -10 }}
            whileHover={{ scale: 1.05 }}
          >
            {gpt ? (
              <div>
                <h1 className="text-2xl font-bold mt-5 mb-5">{gpt[0].name}</h1>
                <p className="text-sm italic">{gpt[0].description}</p>
              </div>
            ) : (
              <h1 className="text-2xl font-bold mt-5 mb-5">
                What can I help you with today?
              </h1>
            )}
          </motion.div>
        )}
        <form onSubmit={handleFormSubmit} className="w-3/4">
          <motion.div
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 10 }}
            exit={{ opacity: 0, y: 12 }}
          >
            <div className="flex flex-row items-center">
              {!pdf ? (
                <div className="flex-col h-32 w-full mr-2 rounded-xl">
                  <textarea
                    name="prompt"
                    ref={inputAreaRef}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your question here..."
                    type="text"
                    className="textarea text-sm px-4 py-2 mx-auto h-full w-full bg-base-200 focus:outline-none focus:ring-1 focus:ring-neutral-500 rounded-xl resize-none"
                    required
                  />
                </div>
              ) : (
                <div className="flex-col w-full mr-2 rounded-xl">
                  <input
                    type="file"
                    className="file-input file-input-sm file-input-primary mb-2"
                    onChange={(event) => {
                      console.log(event.target.files);
                      if (event.target.files && event.target.files.length > 0) {
                        setFiles(event.target.files);
                      }
                    }}
                    multiple
                    ref={fileInputRef}
                    required
                    disabled={hasStarted}
                  />
                  <div>
                    <textarea
                      name="prompt"
                      ref={inputAreaRef}
                      value={input}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your question here..."
                      type="text"
                      className="textarea text-sm px-4 py-2 mx-auto h-32 w-full bg-base-200 focus:outline-none focus:ring-1 focus:ring-neutral-500 rounded-xl resize-none"
                      required
                    />
                  </div>
                </div>
              )}
              <div className="flex-col h-32 py-2">
                <ButtonChat
                  setHasStarted={setHasStarted}
                  isLoading={isLoading}
                />
                <ButtonStopChat isLoading={isLoading} onClick={stop} />
                {!settings.autoSave && (
                  <div>
                    {isSaving ? (
                      <div className="btn btn-outline btn-sm cursor-none">
                        <span className="loading loading-dots loading-xs"></span>
                      </div>
                    ) : (
                      <motion.div
                        transition={{
                          type: "spring",
                          stiffness: 1000,
                          damping: 30,
                        }}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 12 }}
                      >
                        <ButtonSaveChat
                          chatStarted={chatLoaded}
                          isLoading={isLoading}
                          onClick={async () => {
                            setIsSaving(true);
                            await saveMessageManually({
                              uid: uid,
                              messages: messages,
                              model: settings.model,
                              autoTitle: settings.autoTitle,
                              gpt: gpt,
                            });
                            await delay(500);
                            toast.success(`Saved successfully!`);
                            mutate("/api/get-chats/");
                            setIsSaving(false);
                          }}
                        />
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {pdf ? (
              <div className="text-xs flex flex-row mb-2 mt-2 items-center justify-center">
                <BotMessageSquare size={12} className="mr-1" />
                {gptRetrieved.length > 0
                  ? gptRetrieved[0].model
                  : settings.model}
              </div>
            ) : (
              <div className="text-xs flex flex-row mb-2 mt-2 items-center justify-center">
                <BotMessageSquare size={12} className="mr-1" />
                {gptRetrieved.length > 0
                  ? gptRetrieved[0].model
                  : settings.model}
                <ThermometerSun size={12} className="ml-4 mr-1" />
                {settings.temperature / 100}
                <BookOpenText size={12} className="ml-4 mr-1" />
                {Number(settings.maxTokens).toLocaleString()}
                {usage && (
                  <>
                    <Gauge size={12} className="ml-4 mr-1" />
                    {Number(totalUsageTk).toLocaleString()} tokens -{" "}
                    {totalUsageAmount.toFixed(5)}$
                  </>
                )}
              </div>
            )}
            <p className="text-xs text-base-400 justify-center">
              This is an AI-powered assistant. Responses may not always be
              accurate.
            </p>
          </motion.div>
        </form>
      </div>
    </AnimatePresence>
  );
}
