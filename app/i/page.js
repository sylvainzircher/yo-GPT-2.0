"use client";
import React, { useState, useRef, useEffect } from "react";
import HeaderImageGeneration from "@/components/header-img-generation";
import { Download, Paintbrush, Eraser, Replace } from "lucide-react";

export default function GenerateImage() {
  const [prompt, setPrompt] = useState("");
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageBlob, setImageBlob] = useState(null);
  const [previousImageURL, setPreviousImageURL] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);

  const fileInputRef = useRef(null);

  const handleGenerate = async () => {
    setLoading(true);
    setImageSrc(null);

    try {
      const form = new FormData();
      form.append("prompt", prompt);

      if (imageBlob) {
        setPreviousImageURL(URL.createObjectURL(imageBlob));
        const file = new File([imageBlob], "init_image.jpg", {
          type: "image/jpeg",
        });
        form.append("init_image", file);
      }

      const response = await fetch("/api/generate-image", {
        method: "POST",
        body: form,
      });

      if (!response.ok) {
        throw new Error("Failed to generate image");
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob); // creates a temp URL from blob
      setImageSrc(imageUrl);
      setImageBlob(blob);
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!imageBlob) return;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(imageBlob);
    link.download = "generated_image.jpg";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const swap = () => {
    let previousURL = previousImageURL;
    setImageSrc(previousURL);
    setPreviousImageURL(imageSrc);
  };

  const refresh = () => {
    if (imageSrc) {
      URL.revokeObjectURL(imageSrc);
    }
    if (previousImageURL) {
      URL.revokeObjectURL(previousImageURL);
    }

    setPrompt("");
    setPreviousImageURL(null);
    setImageSrc(null);
    setImageBlob(null);
    setUploadFile(null);
  };

  useEffect(() => {
    if (imageSrc) {
      URL.revokeObjectURL(imageSrc);
    }
    if (previousImageURL) {
      URL.revokeObjectURL(previousImageURL);
    }
  }, []);

  return (
    <div className="h-screen flex flex-row">
      <div className="h-screen h-full flex flex-col w-full justify-between">
        <HeaderImageGeneration />
        <div className="flex flex-col mx-auto mb-4">
          {previousImageURL && !loading && (
            <div className="flex flex-col mx-auto w-full">
              <img
                src={previousImageURL}
                alt="Generated"
                className="m-1 w-16 h-16 rounded-xl border"
              />
              <p className="text-xs text-gray-300"> Previous generated image</p>
            </div>
          )}
          {imageSrc ? (
            <div>
              <img
                src={imageSrc}
                alt="Generated"
                className="w-64 mt-4 rounded-xl border"
              />
              <div className="tooltip tooltip-bottom" data-tip="Download">
                <button
                  onClick={handleDownload}
                  className="btn btn-sm btn-outline mt-2"
                >
                  <Download size={16} />
                </button>
              </div>
              {previousImageURL && (
                <div
                  className="tooltip tooltip-bottom"
                  data-tip="Swap with previous"
                >
                  <button
                    onClick={swap}
                    className="btn btn-sm btn-outline ml-2 mt-2"
                  >
                    <Replace size={16} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            loading && <span className="loading loading-ring loading-xl"></span>
          )}
        </div>
        <div className="flex flex-col w-2/3 mx-auto">
          <div className="flex flex-col">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Type your prompt here..."
              className="textarea textarea-bordered w-full h-24 mb-4"
            />
            <div className="flex flex-row mx-auto mb-4 ">
              <button
                onClick={handleGenerate}
                className="btn btn-sm btn-primary w-fit"
                disabled={loading || prompt.length == 0}
              >
                <Paintbrush size={16} className="mr-1" />
                {loading
                  ? "Generating..."
                  : imageBlob
                  ? "Update Image"
                  : "Generate Image"}
              </button>
              <button onClick={refresh} className="ml-4 btn btn-sm btn-outline">
                <Eraser size={16} className="mr-1" />
                Restart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
