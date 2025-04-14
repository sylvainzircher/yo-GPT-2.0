import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ellipsis, Trash2, Pen, Plus } from "lucide-react";
import { deleteGPTById } from "@/libs/delete-gpt";
import { BotMessageSquare } from "lucide-react";
import { models } from "@/data/models";
import { useSWRConfig } from "swr";
import { updateGPT } from "@/libs/update-gpt";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ButtonSidebarGPT({ gpt }) {
  const [hoveredGPT, setHoveredGPT] = useState(null);
  const [gptMenu, setGPTMenu] = useState(null);
  const [gptData, setGPTData] = useState({
    id: gpt.id,
    model: gpt.model,
    name: gpt.name,
    description: gpt.description,
    instructions: gpt.instructions,
    timestamp: gpt.timestamp,
  });
  const { mutate } = useSWRConfig();

  const router = useRouter();

  const gptClicked = (id) => {
    setGPTMenu(id);
  };

  const leaveGPTMenu = (id) => {
    setHoveredGPT(null);
    setGPTMenu(null);
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
    await updateGPT(gptData);
    setGPTMenu(false);
    toast.success(`Updated successfully!`);
    mutate("/api/get-gpts/");
    mutate(`/api/get-gpt-by-id/${gptData.id}`);
  };

  return (
    <div className="relative">
      <div
        className={`mb-1 mt-1 btn btn-sm btn-ghost border-none no-animation w-full text-xs justify-between cursor-default ${
          gptMenu === gpt.id ? "bg-base-300" : ""
        } hover:opacity-100 hover:shadow-none hover:bg-transparent`}
        onMouseEnter={() => setHoveredGPT(gpt.id)}
        onMouseLeave={() => (gptMenu === gpt.id ? null : setHoveredGPT(null))}
      >
        <p className="text-left w-3/4 truncate items-center">
          <BotMessageSquare size={12} className="mr-1 inline-flex" /> {gpt.name}
        </p>
        <AnimatePresence>
          {hoveredGPT === gpt.id && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onClick={() => gptClicked(gpt.id)}
              onMouseLeave={() =>
                gptMenu === gpt.id ? null : setGPTMenu(null)
              }
            >
              <Ellipsis size={16} className="w-8 h-6 cursor-pointer" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {gptMenu === gpt.id && (
        <div className="w-full" onMouseLeave={() => leaveGPTMenu()}>
          <motion.div
            className="text-xs absolute top-8 z-50 right-0"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
          >
            <div className="bg-base-100 shadow rounded-lg text-center justify-center items-center">
              <div className="w-full h-full hover:bg-base-200 p-1">
                <button className="text-xs flex flex-row items-center p-2">
                  <div
                    className="flex flex-row items-center"
                    onClick={() =>
                      (window.location.href = `/g/?gptid=${gpt.id}`)
                    }
                  >
                    <Plus size={16} />
                  </div>
                </button>
              </div>
              <div className="w-full h-full hover:bg-base-200 p-1">
                <button className="text-xs flex flex-row items-center p-2">
                  <div
                    className="flex flex-row items-center"
                    onClick={() =>
                      document.getElementById("edit_gpt").showModal()
                    }
                  >
                    <Pen size={16} />
                  </div>
                </button>
                <dialog id="edit_gpt" className="modal">
                  <div className="modal-box w-11/12 max-w-5xl">
                    <h3 className="font-bold text-lg mb-5">Edit {gpt.name}</h3>
                    <form onSubmit={(e) => handleSubmit(e)}>
                      <select
                        name="model"
                        className="select select-bordered select-sm w-full text-sm max-w-xs mb-2"
                        onChange={handleChange}
                        value={gptData.model}
                      >
                        <option disabled key={-1} value="">
                          Model:
                        </option>
                        {models
                          .filter((model) => model.name !== "deepseek-r1")
                          .map((model, index) => (
                            <option key={index}>{model.name}</option>
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
                          placeholder={gpt.name}
                          className="input w-full input-bordered input-sm mb-2"
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
                          placeholder={gpt.description}
                          className="input w-full input-bordered input-sm mb-2"
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
                          placeholder={gpt.instructions}
                          type="text"
                          className="text-sm mt-2 mx-auto h-32 w-full border input-sm input-bordered rounded-xl p-2"
                        />
                      </label>
                      <div className="modal-action w-full justify-center">
                        <button className="btn btn-sm btn-outline mr-2">
                          Edit
                        </button>
                        <button
                          className="btn btn-sm"
                          onClick={(e) => {
                            e.preventDefault();
                            document.getElementById("edit_gpt").close();
                            setGPTData({
                              id: gpt.id,
                              model: gpt.model,
                              name: gpt.name,
                              description: gpt.description,
                              instructions: gpt.instructions,
                              timestamp: gpt.timestamp,
                            });
                          }}
                        >
                          Close
                        </button>
                      </div>
                    </form>
                  </div>
                </dialog>
              </div>
              <div className="w-full h-full hover:bg-base-200 p-1">
                <button
                  className="text-xs text-error flex flex-row items-center p-2"
                  onClick={() =>
                    document.getElementById("delete_gpt").showModal()
                  }
                >
                  <div className="flex flex-row items-center">
                    <Trash2 size={16} />
                  </div>
                </button>
                <dialog
                  id="delete_gpt"
                  className="modal modal-bottom sm:modal-middle"
                >
                  <div className="modal-box">
                    <h3 className="font-bold text-lg">Delete custom GPT?</h3>
                    <div className="divider"></div>
                    <p>
                      This will delete
                      <span className="ml-1 font-bold">{gpt.name}</span>.
                    </p>
                    <div className="modal-action w-full justify-center">
                      <button
                        className="btn btn-sm btn-outline btn-error mr-2"
                        onClick={() => {
                          deleteGPTById(gpt.id);
                          document.getElementById("delete_gpt").close();
                          window.location.href = "/";
                          toast.success(`${gpt.name} successfully deleted`);
                        }}
                      >
                        Delete
                      </button>
                      <button
                        className="btn btn-sm"
                        onClick={() =>
                          document.getElementById("delete_gpt").close()
                        }
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </dialog>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
