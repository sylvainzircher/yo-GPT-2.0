"use client";
import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { models } from "@/data/models";
import { useSWRConfig } from "swr";

export default function ModelSelector({ settings, setSettings }) {
  const [showModal, setShowModal] = useState(false);
  const modelListRef = useRef(null);
  const { mutate } = useSWRConfig();

  const updateModelSettings = async (type, value) => {
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: type, value: value }),
      });
      const data = await response.json();
      if (type === "model") {
        setSettings((prevSettings) => ({
          ...prevSettings,
          model: value,
        }));
      }
    } catch (error) {
      console.error("Error updating model:", error);
    }
  };

  const toggleShowModelList = () => {
    setShowModal(!showModal);
  };

  const modelSelection = async (model) => {
    await updateModelSettings("model", model);
    setShowModal(!showModal);
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        modelListRef.current &&
        !modelListRef.current.contains(event.target)
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
    <div ref={modelListRef}>
      <button
        className={`btn text-xs flex flex-row align-middle items-center ${
          showModal ? "border border-neutral" : ""
        }`}
        onClick={toggleShowModelList}
      >
        Pick a model
        <ChevronDown className="ml-1" size={16} />
      </button>
      {showModal && (
        <div className="card bg-base-100 w-96 h-80 shadow-xl overflow-y-auto fixed top-20 border border-neutral-content">
          <div className="card-body">
            {models.map((model, index) => (
              <div key={index} className="p-1 rounded-xl form-control">
                <div className="p-1 flex flex-row items-center w-full justify-between">
                  <div className="flex flex-col justify-start">
                    <span className="label-text">
                      <p className="font-bold">{model.name}</p>
                      <p className="text-xs">
                        {model.price} | {model.size}
                      </p>
                    </span>
                  </div>
                  <div className="justify-end">
                    <input
                      type="radio"
                      name="model"
                      className="radio radio-sm checked:radio-primary justify-right"
                      defaultChecked={model.name === settings.model}
                      onClick={() => {
                        modelSelection(model.name);
                        mutate("/api/settings/");
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
