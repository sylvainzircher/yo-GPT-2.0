"use client";
import React, { useState, useRef, useEffect } from "react";
import HeaderImageGeneration from "@/components/header-img-generation";
import {
  Download,
  Paintbrush,
  Eraser,
  Replace,
  NotebookText,
  ImageUpscale,
  Gauge,
} from "lucide-react";
import useSWR, { useSWRConfig } from "swr";
import { AnimatePresence, motion } from "framer-motion";
import { getImageGenUsageById } from "@/libs/get-imagegen-usage-by-id";

export default function GenerateImage() {
  const [usageCost, setUsageCost] = useState(0);
  const [imageID, setImageID] = useState(null);
  const [settings, setSettings] = useState({});
  const [prompt, setPrompt] = useState("");
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageBlob, setImageBlob] = useState(null);
  const [previousImageURL, setPreviousImageURL] = useState(null);
  const { mutate } = useSWRConfig();

  const fetcher = (url) => fetch(url).then((res) => res.json());
  const { data: imageSettings } = useSWR("/api/imageSettings/", fetcher);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (imageSettings) {
      setSettings({
        imageStrength: imageSettings.settings.imageStrength,
        cfgScale: imageSettings.settings.cfgScale,
      });
    }
  }, [imageSettings]);

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

      form.append("cfg_scale", settings.cfgScale);
      form.append("image_strength", settings.imageStrength);
      form.append("uid", imageID);

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
      let usage = await getImageGenUsageById(imageID);
      setUsageCost(usage.cost);
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
    setUsageCost(0);
  };

  useEffect(() => {
    setImageID(crypto.randomUUID());
    if (imageSrc) {
      URL.revokeObjectURL(imageSrc);
    }
    if (previousImageURL) {
      URL.revokeObjectURL(previousImageURL);
    }
  }, []);

  return (
    <AnimatePresence>
      <div className="h-screen flex flex-row">
        <div className="h-screen h-full flex flex-col w-full justify-between">
          <HeaderImageGeneration
            settings={settings}
            setSettings={setSettings}
          />
          <div className="flex flex-col mx-auto mb-4">
            {previousImageURL && !loading && (
              <div className="flex flex-col mx-auto w-full">
                <img
                  src={previousImageURL}
                  alt="Generated"
                  className="m-1 w-16 h-16 rounded-xl border"
                />
                <p className="text-xs text-gray-300"> Control image</p>
              </div>
            )}
            {imageSrc ? (
              <motion.div
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: -20 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <img
                  src={imageSrc}
                  alt="Generated"
                  className="w-72 mt-4 rounded-xl border"
                />
                <div className="tooltip tooltip-left" data-tip="Download">
                  <button
                    onClick={handleDownload}
                    className="btn btn-sm btn-outline mt-2"
                  >
                    <Download size={16} />
                  </button>
                </div>
                {previousImageURL && (
                  <div
                    className="tooltip tooltip-right"
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
              </motion.div>
            ) : (
              loading && (
                <span className="loading loading-ring loading-xl"></span>
              )
            )}
          </div>
          <motion.div
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: -20 }}
            exit={{ opacity: 0, x: -10 }}
          >
            <div className="flex flex-col w-2/3 mx-auto">
              <div className="flex flex-col">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Type your prompt here... for example: A golden retriever wearing round glasses and a bow tie, sitting in a cozy library with a cup of coffee, soft lighting, photorealistic"
                  className="textarea textarea-bordered w-full h-24 mb-1"
                />
                <div className="flex flex-row mx-auto mb-4 text-xs">
                  <p className="mr-1 flex flex-row items-center">
                    <NotebookText size={12} className="ml-4 mr-1" />
                    Cfg Scale: {settings.cfgScale}
                  </p>
                  <p className="ml-1 flex flex-row items-center">
                    <ImageUpscale size={12} className="ml-4 mr-1" />
                    Image Stength: {settings.imageStrength}
                  </p>
                  <p className="ml-1 flex flex-row items-center">
                    <Gauge size={12} className="ml-4 mr-1" />
                    Cost: ${usageCost}
                  </p>
                </div>
                <div className="flex flex-row mx-auto mb-4">
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
                  <button
                    onClick={refresh}
                    className="ml-4 btn btn-sm btn-outline"
                  >
                    <Eraser size={16} className="mr-1" />
                    Restart
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
