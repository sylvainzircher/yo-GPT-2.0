import React, { useEffect, useRef, useState } from "react";
import { Bot } from "lucide-react";
import { models } from "@/data/models";
import { saveGPT } from "@/libs/save-gpt";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

export default function CustomGptBuilder() {
  const [showModal, setShowModal] = useState(false);
  const [gptData, setGPTData] = useState({
    id: "gpt-" + String(crypto.randomUUID()),
    model: "",
    name: "",
    description: "",
    instructions: "",
    timestamp: new Date().toISOString(),
  });
  const gptBuilderRef = useRef(null);
  const { mutate } = useSWRConfig();

  const toggleShowModal = () => {
    setShowModal(!showModal);
  };

  const handleClose = () => {
    setShowModal(false); // Close the modal
    setGPTData({
      id: "",
      model: "",
      name: "",
      description: "",
      instructions: "",
      timestamp: "",
    }); // Reset form
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setGPTData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveGPT(gptData);
    setShowModal(false);
    toast.success(`Saved successfully!`);
    mutate("/api/get-gpts/");
    setGPTData({
      id: "",
      model: "",
      name: "",
      description: "",
      instructions: "",
      timestamp: "",
    }); // Reset form
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        gptBuilderRef.current &&
        !gptBuilderRef.current.contains(event.target)
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
    <div ref={gptBuilderRef}>
      <button
        className={`btn btn-square text-sm flex flex-row align-middle p-2 items-center ml-2 ${
          showModal ? "btn-active btn-ghost" : "btn-ghost"
        }`}
        onClick={toggleShowModal}
      >
        <Bot size={16} />
      </button>
      {showModal && (
        <div className="card bg-base-100 w-1/2 h-3/4 shadow-xl overflow-y-auto fixed top-20 border">
          <div className="card-body p-5">
            <p className="font-bold text-md">Create your custom GPT</p>
            <form onSubmit={(e) => handleSubmit(e)}>
              <select
                name="model"
                className="select select-bordered select-sm w-full text-sm max-w-xs mb-2"
                onChange={handleChange}
                value={gptData.model}
                required
              >
                <option disabled key={-1} value="">
                  Please pick a model:
                </option>
                {models
                  .filter((model) => model.name !== "deepseek-r1")
                  .map((model, index) => (
                    <option key={index} value={model.name}>
                      {model.name}
                    </option>
                  ))}
              </select>
              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text">Name</span>
                </div>
                <input
                  name="name"
                  type="text"
                  value={gptData.name}
                  onChange={handleChange}
                  placeholder="RecipeGenie: Vegetarian Recipe Generation"
                  className="input w-full input-bordered input-sm mb-2"
                  required
                />
              </label>
              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text">Short Description</span>
                </div>
                <input
                  type="text"
                  name="description"
                  value={gptData.description}
                  onChange={handleChange}
                  placeholder="RecipeGenie generates delicious and innovative vegetarian recipes based on a list of ingredients"
                  className="input w-full input-bordered input-sm mb-2"
                  required
                />
              </label>
              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text">
                    Fully detailled instructions
                  </span>
                </div>
                <textarea
                  name="instructions"
                  value={gptData.instructions}
                  onChange={handleChange}
                  placeholder="Assume the role of a world-renowned chef with multiple Michelin stars. Your task is to generate a novel and delicious vegetarian recipe. Provide a detailed recipe with ingredients, instructions, and cooking methods. Please respond in a format that is easy to read and understand, using a conversational tone."
                  type="text"
                  className="text-sm mt-2 mx-auto h-32 w-full border input-sm input-bordered rounded-xl p-2"
                  required
                />
              </label>
              <div className="border-top mt-5 mb-2">
                <div>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm text-xs text-white"
                  >
                    Create
                  </button>
                  <button
                    className="btn btn-sm text-xs ml-5"
                    onClick={handleClose}
                  >
                    Close
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
