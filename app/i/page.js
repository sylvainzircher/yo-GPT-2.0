"use client";
import React, { useState, useRef, useEffect } from "react";

export default function GenerateImage() {
  const [prompt, setPrompt] = useState("");
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageBlob, setImageBlob] = useState(null);
  const [previousImageURL, setPreviousImageURL] = useState(null);
  const [hasUploaded, setHasUploaded] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);

  const fileInputRef = useRef(null);

  const handleGenerate = async () => {
    setLoading(true);
    setImageSrc(null);

    try {
      const form = new FormData();
      form.append("prompt", prompt);

      // On first interaction upload file if exists
      if (!hasUploaded && uploadFile) {
        form.append("init_image", uploadFile);
        setHasUploaded(true);
      } else if (imageBlob) {
        // If refining generated image
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
    setHasUploaded(null);
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
    <div className="flex flex-col gap-4 p-6">
      {!hasUploaded && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">
            Optional: Upload a base image
          </label>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setUploadFile(e.target.files[0]);
              }
            }}
            className="file-input file-input-bordered"
          />
        </div>
      )}
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Type your prompt here..."
        className="textarea textarea-bordered w-full h-24"
      />
      <div className="flex flex-row">
        <button
          onClick={handleGenerate}
          className="btn btn-primary w-fit"
          disabled={loading || prompt.length == 0}
        >
          {loading
            ? "Generating..."
            : imageBlob
            ? "Update Image"
            : "Generate Image"}
        </button>
        <button onClick={refresh} className="ml-4 btn btn-outline">
          Refresh
        </button>
      </div>

      <div className="flex flex-row">
        {previousImageURL && (
          <img
            src={previousImageURL}
            alt="Generated"
            className="m-4 w-32 h-32 rounded-xl border"
          />
        )}

        {imageSrc && (
          <div>
            <img
              src={imageSrc}
              alt="Generated"
              className="w-128 mt-4 rounded-xl border"
            />
            <button onClick={handleDownload} className="btn btn-outline mt-2">
              Download Image
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
