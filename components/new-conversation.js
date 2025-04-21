import React, { useEffect, useRef, useState } from "react";
import { Plus, Bot, Paperclip, Brush } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CustomGptBuilder() {
  const [showModal, setShowModal] = useState(false);
  const documentUploaderRef = useRef(null);
  const router = useRouter();

  const handleClick = () => {
    window.location.href = "/";
  };

  const chatWithDoc = () => {
    window.location.href = "/pdf";
  };

  const generateImage = () => {
    window.location.href = "/i";
  };

  const toggleShowModal = () => {
    setShowModal(!showModal);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        documentUploaderRef.current &&
        !documentUploaderRef.current.contains(event.target)
      ) {
        setShowModal(false);
      }
    }
    if (showModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showModal]);

  return (
    <div ref={documentUploaderRef}>
      <button
        className={`btn btn-square text-sm flex flex-row align-middle p-2 items-center ${
          showModal ? "btn-active btn-ghost" : "btn-ghost"
        }`}
        onClick={toggleShowModal}
      >
        <Plus size={16} />
      </button>
      {showModal && (
        <div className="card bg-base-100 shadow-xl overflow-y-auto fixed top-20 border border-neutral-content">
          <div className="card-body">
            <p className="font-bold text-md mb-3">Start a conversation</p>
            <div>
              <button
                className="btn btn-primary btn-sm text-xs text-white"
                onClick={handleClick}
              >
                <Bot size={16} /> New Conversation
              </button>
              <button className="btn btn-sm text-xs ml-5" onClick={chatWithDoc}>
                <Paperclip size={16} /> Chat to a document
              </button>
              <button
                className="btn btn-sm btn-secondary text-xs ml-5"
                onClick={generateImage}
              >
                <Brush size={16} /> Generate Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
