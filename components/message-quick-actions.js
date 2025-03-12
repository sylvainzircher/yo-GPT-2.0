import { useState } from "react";
import {
  CheckIcon,
  CopyIcon,
  RefreshCcw,
  Pencil,
  X,
  Check,
} from "lucide-react";

export function MessageQuickActions({
  message,
  reload,
  isEditing,
  index,
  setIndexChat,
  onClick,
  onCancel,
  isLoading,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(String(message.content).trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleEditOrSave = () => {
    onClick();
    setIndexChat(index);
  };

  const handleReload = () => {
    reload({ body: { isReload: true } });
  };

  return (
    <div>
      {message.role === "assistant" ? (
        !isLoading && (
          <div className="mt-4 text-sm border-t">
            <div className="tooltip tooltip-bottom" data-tip="Copy">
              <button
                onClick={handleCopy}
                className="flex items-center hover:bg-base-200 transition p-2 mt-2 mr-2 rounded-lg"
              >
                {copied ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
              </button>
            </div>
            {reload && (
              <div className="tooltip tooltip-bottom" data-tip="Refresh">
                <button
                  onClick={handleReload}
                  className="flex items-center hover:bg-base-200 transition p-2 mt-2 mr-2 rounded-lg"
                >
                  <RefreshCcw size={12} />
                </button>
              </div>
            )}
          </div>
        )
      ) : (
        <div>
          {reload && (
            <div className="flex justify-end">
              <div>
                {!isEditing ? (
                  <div className="flex flex-row items-center">
                    <div className="tooltip tooltip-bottom" data-tip="Copy">
                      <button
                        onClick={handleCopy}
                        className="flex items-center hover:bg-base-200 transition p-2 mt-2 mr-2 rounded-lg"
                      >
                        {copied ? (
                          <CheckIcon size={12} />
                        ) : (
                          <CopyIcon size={12} />
                        )}
                      </button>
                    </div>
                    <div className="tooltip tooltip-bottom" data-tip="Edit">
                      <div
                        onClick={handleEditOrSave}
                        className="flex items-center hover:bg-base-200 transition p-2 mt-2 mr-2 rounded-lg"
                      >
                        <Pencil size={12} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-row">
                    <div
                      onClick={onCancel}
                      className="tooltip tooltip-bottom flex items-center hover:bg-base-200 transition p-2 mt-2 mr-2 rounded-lg"
                      data-tip="Close"
                    >
                      <X size={16} />
                    </div>
                    <div
                      onClick={handleEditOrSave}
                      className="tooltip tooltip-bottom flex items-center hover:bg-base-200 transition p-2 mt-2 mr-2 rounded-lg"
                      data-tip="Save"
                    >
                      <Check size={16} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
