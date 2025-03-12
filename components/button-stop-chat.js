import { Square } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function ButtonStopChat({ isLoading, onClick }) {
  return (
    <AnimatePresence>
      <div>
        {isLoading && (
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
            <div
              className="tooltip tooltip-right ml-1 mr-1 mb-1"
              data-tip="Stop"
            >
              <button
                type="button"
                className={`btn btn-outline btn-sm ${
                  !isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={!isLoading}
                onClick={(e) => {
                  e.stopPropagation();
                  onClick(e);
                }}
              >
                <Square size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
}
