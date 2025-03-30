"use client";
import React, { useState, useEffect, useRef } from "react";
import { Settings2, BadgeInfo, BookOpenText } from "lucide-react";
import { useSWRConfig } from "swr";

export default function ModelSettings({ settings, setSettings }) {
  const [showModelSettings, setShowModelSettings] = useState(false);
  const [temperature, setTemperature] = useState(40);
  const [autoSave, setAutoSave] = useState(true);
  const [maxTokens, setMaxTokens] = useState(1200);
  const [autoTitle, setAutoTitle] = useState(true);
  const modelSettingsRef = useRef(null);
  const { mutate } = useSWRConfig();

  useEffect(() => {
    setTemperature(settings.temperature);
    setAutoSave(settings.autoSave);
    setAutoTitle(settings.autoTitle);
    setMaxTokens(settings.maxTokens);
  }, [settings]);

  const updateModelSettings = async (type, value) => {
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: type, value: value }),
      });
      const data = await response.json();
      if (type === "temperature") {
        setSettings((prevSettings) => ({
          ...prevSettings,
          temperature: value,
        }));
        console.log("Model temperature updated");
      }
      if (type === "maxTokens") {
        setSettings((prevSettings) => ({
          ...prevSettings,
          maxTokens: value,
        }));
        console.log("Model maxTokens updated");
      }
      if (type === "autoSave") {
        console.log("Auto save");
        setSettings((prevSettings) => ({
          ...prevSettings,
          autoSave: value,
        }));
        console.log("Autosave setting updated");
      }
      if (type === "autoTitle") {
        console.log("Auto Title");
        setSettings((prevSettings) => ({
          ...prevSettings,
          autoTitle: value,
        }));
        console.log("Autosave setting updated");
      }
    } catch (error) {
      console.error("Error updating model temperature:", error);
    }
  };

  const toggleShowModelSettings = () => {
    setShowModelSettings(!showModelSettings);
  };

  const settingsSubmit = async (e) => {
    e.preventDefault();
    try {
      await Promise.all([
        updateModelSettings("temperature", temperature),
        updateModelSettings("maxTokens", maxTokens),
        updateModelSettings("autoSave", autoSave),
        updateModelSettings("autoTitle", autoTitle),
      ]);
      mutate("/api/settings/");
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
                <div className="flex flex-row items-center">
                  <div
                    className="tooltip tooltip-left"
                    data-tip="The temperature of an LLM (Large Language Model) is like a creativity setting that controls how predictable or random the model's responses are. 100: highest creativity, 0: lowest creativity"
                  >
                    <BadgeInfo size={14} className="text-primary mr-2" />
                  </div>
                  <p className="text-sm">Temperature: </p>
                  <input
                    type="range"
                    min={0}
                    max="100"
                    value={temperature}
                    className="range range-xs ml-3 w-64"
                    onChange={(e) => setTemperature(e.target.value)}
                  />
                  <p className="ml-3 text-sm w-16">{temperature}</p>
                </div>
                <div className="flex flex-row items-center mt-5">
                  <div
                    className="tooltip tooltip-left"
                    data-tip="Automatically save your conversation by default. If switched off you will have to manually save them."
                  >
                    <BadgeInfo size={14} className="text-primary mr-2" />
                  </div>
                  <p className="text-sm">Auto-save conversations: </p>
                  <input
                    type="checkbox"
                    className="toggle toggle-success toggle-sm"
                    value={autoSave}
                    onChange={(e) => setAutoSave(e.target.checked)}
                    checked={autoSave}
                  />
                </div>
                <div className="flex flex-row items-center mt-5">
                  <div
                    className="tooltip tooltip-left"
                    data-tip="Uses some of your credit to automatically create a meaningful title for your conversations."
                  >
                    <BadgeInfo size={14} className="text-primary mr-2" />
                  </div>
                  <p className="text-sm">Meaningfull title creation: </p>
                  <input
                    type="checkbox"
                    className="toggle toggle-success toggle-sm"
                    value={autoTitle}
                    onChange={(e) => setAutoTitle(e.target.checked)}
                    checked={autoTitle}
                  />
                </div>
                <div className="flex flex-row items-center mt-5">
                  <div
                    className="tooltip tooltip-left"
                    data-tip="Maximum number of tokens to generate."
                  >
                    <BadgeInfo size={14} className="text-primary mr-2" />
                  </div>
                  <p className="text-sm w-full">Max Tokens: </p>
                  <label className="input input-bordered input-sm">
                    <div className="flex flex-row items-center">
                      <BookOpenText size={16} className="mr-2" />
                      <input
                        type="text"
                        className="grow"
                        placeholder={maxTokens}
                        onChange={(e) => setMaxTokens(Number(e.target.value))}
                      />
                    </div>
                  </label>
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
  );
}
