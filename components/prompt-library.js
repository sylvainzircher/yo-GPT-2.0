import React, { useEffect, useRef, useState } from "react";
import { Library, CheckIcon, CopyIcon } from "lucide-react";

const prompts = [
  "A futuristic city skyline at dusk, with flying cars and neon lights, cinematic wide shot, cyberpunk art style, moody atmosphere, 4k",
  "A golden retriever wearing round glasses and a bow tie, sitting in a cozy library with a cup of coffee, soft lighting, photorealistic",
  "A peaceful mountain lake at sunrise, pine trees surrounding the water, reflection of the sky, ultra-detailed landscape photography",
  "A female astronaut floating in zero gravity inside a futuristic spaceship, glowing instrument panels, anime-style, dramatic lighting",
  "A wizard with a long silver beard and glowing blue eyes, holding a crystal staff, standing in a misty forest, detailed concept art",
];

export default function PromptLibrary() {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(null);
  const documentUploaderRef = useRef(null);

  const toggleShowModal = () => {
    setShowModal(!showModal);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(String(text).trim());
    setCopied(text);
    setTimeout(() => setCopied(false), 1500);
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
        className={`btn btn-square text-sm flex flex-row align-middle p-2 items-center ml-2 ${
          showModal ? "border border-neutral" : ""
        }`}
        onClick={toggleShowModal}
      >
        <Library size={16} />
      </button>
      {showModal && (
        <div className="bg-base-100 rounded-xl shadow-xl overflow-y-auto fixed top-20 right-10 w-1/2 border border-neutral-content">
          <p className="font-bold text-md m-3">Some prompt examples:</p>
          {prompts.map((text, index) => (
            <div
              className="border-t border-neutral-content flex flex-row items-center "
              key={index}
            >
              <p className="text-xs p-4">{text}</p>
              <button
                onClick={() => handleCopy(text)}
                className="flex items-center transition p-2 mt-2 mr-2 rounded-lg cursor-pointer"
              >
                {copied === text ? (
                  <CheckIcon size={12} />
                ) : (
                  <div className="tooltip" data-tip="Copy">
                    <CopyIcon size={12} />
                  </div>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
