import { Markdown } from "./markdown";
import { AnimatePresence, motion } from "framer-motion";

export function MessageReasoning({ message, isLoading }) {
  return (
    <AnimatePresence>
      <div>
        {isLoading && !message.content ? (
          <div className="flex flex-row items-center">
            <p className="text-sm m-3 italic">Reasoning</p>
            <span className="loading loading-dots loading-sm"></span>
          </div>
        ) : (
          <div>
            <motion.div
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 2 }}
            >
              <p className="text-sm mb-3">Reasoning</p>
              <div className="text-xs border-t border-b pt-3 pb-3 italic">
                <Markdown>{message.reasoning}</Markdown>
              </div>
            </motion.div>
          </div>
        )}
        <div className="mt-5">
          <Markdown>{message.content}</Markdown>
        </div>
      </div>
    </AnimatePresence>
  );
}

export function Message({ message, isLoading, pdf }) {
  return (
    <div>
      {pdf ? (
        <div className="mt-5">
          <Markdown>{message.content}</Markdown>
        </div>
      ) : isLoading ? (
        <div className="flex flex-row items-center">
          <span className="loading loading-dots loading-sm"></span>
        </div>
      ) : (
        <div className="mt-5">
          <Markdown>{message.content}</Markdown>
        </div>
      )}
    </div>
  );
}
