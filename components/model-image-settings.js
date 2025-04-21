"use client";
import React, { useState, useEffect, useRef } from "react";
import { Settings2, BadgeInfo } from "lucide-react";
import { useSWRConfig } from "swr";

export default function ModelImageSettings({ settings, setSettings }) {
  const [showModelSettings, setShowModelSettings] = useState(false);
  const [imageStrength, setImageStrength] = useState(20);
  const [cfgScale, setCfgScale] = useState(7);
  const modelSettingsRef = useRef(null);
  const { mutate } = useSWRConfig();

  useEffect(() => {
    setImageStrength(settings.imageStrength);
    setCfgScale(settings.cfgScale);
  }, [settings]);

  const updateModelSettings = async (type, value) => {
    try {
      const response = await fetch("/api/imageSettings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: type, value: value }),
      });
      const data = await response.json();
      if (type === "imageStrength") {
        setSettings((prevSettings) => ({
          ...prevSettings,
          imageStrength: value,
        }));
      }
      if (type === "cfgScale") {
        setSettings((prevSettings) => ({
          ...prevSettings,
          cfgScale: value,
        }));
      }
    } catch (error) {
      console.error("Error updating model settings:", error);
    }
  };

  const toggleShowModelSettings = () => {
    setShowModelSettings(!showModelSettings);
  };

  const settingsSubmit = async (e) => {
    e.preventDefault();
    try {
      await Promise.all([
        updateModelSettings("imageStrength", imageStrength),
        updateModelSettings("cfgScale", cfgScale),
      ]);
      mutate("/api/imageSettings/");
      setShowModelSettings(false);
    } catch (error) {
      console.error("Failed to update settings:", error);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        modelSettingsRef.current &&
        !modelSettingsRef.current.contains(event.target)
      ) {
        setShowModelSettings(false);
      }
    }
    if (showModelSettings) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showModelSettings]);

  return (
    <div ref={modelSettingsRef}>
      <div>
        <button
          className={`btn btn-square text-sm flex flex-row align-middle p-2 items-center ml-2 ${
            showModelSettings ? "border border-neutral" : ""
          }`}
          onClick={toggleShowModelSettings}
        >
          <Settings2 size={16} />
        </button>
        {showModelSettings && (
          <div className="card bg-base-100 w-96 shadow-xl fixed top-20 border border-neutral-content">
            <div className="card-body">
              <form onSubmit={(e) => settingsSubmit(e)}>
                <div>
                  <div className="flex flex-row items-center mt-4">
                    <div
                      className="tooltip tooltip-left"
                      data-tip="This tells the model how strongly it should stick to the input image when generating a new one from a prompt. Creativity / Prompt Freedom (10 – 40) | Original Image Fidelity (70 – 100)."
                    >
                      <BadgeInfo size={14} className="text-primary mr-2" />
                    </div>
                    <p className="text-sm w-42">Img strength: </p>
                    <input
                      type="range"
                      min={0}
                      max="100"
                      value={imageStrength}
                      className="range range-xs ml-3 w-64"
                      onChange={(e) => setImageStrength(e.target.value)}
                    />
                    <p className="ml-3 text-sm w-16">{imageStrength}</p>
                  </div>
                  <div className="flex flex-row items-center mt-4">
                    <div
                      className="tooltip tooltip-left"
                      data-tip="It controls how strictly the model follows your prompt vs. how much it relies on its own internal 'imagination' and training patterns. (5–7) the model to interpret more freely. (8–12) forces the model to inject new objects into an image. "
                    >
                      <BadgeInfo size={14} className="text-primary mr-2" />
                    </div>
                    <p className="text-sm w-42">cfg scale: </p>
                    <input
                      type="range"
                      min={0}
                      max="20"
                      value={cfgScale}
                      className="range range-xs ml-3 w-64"
                      onChange={(e) => setCfgScale(e.target.value)}
                    />
                    <p className="ml-3 text-sm w-16">{cfgScale}</p>
                  </div>
                </div>
                <br />
                <div className="divider mt-0 mb-5"></div>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm text-xs text-white"
                >
                  Update
                </button>
                <button className="btn btn-sm text-xs ml-5">Close</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
