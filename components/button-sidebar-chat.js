import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ellipsis, Trash2, Pen, PenLine } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteChatsById } from "@/libs/delete-chat";
import { renameChat } from "@/libs/rename-chat";
import { useSWRConfig } from "swr";

export default function ButtonSidebarChat({ c }) {
  const [hoveredChat, setHoveredChat] = useState(null);
  const [chatMenu, setChatMenu] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const { mutate } = useSWRConfig();

  const router = useRouter();

  const handleChatClick = (id) => {
    if (id.includes("gpt")) {
      router.push(`/g?id=${id}`);
    } else {
      router.push(`/?id=${id}`);
    }
  };

  const chatClicked = (id) => {
    setChatMenu(id);
  };

  const leaveChatMenu = (id) => {
    setHoveredChat(null);
    setChatMenu(null);
  };

  return (
    <div className="relative z-500">
      <div className="w-full">
        <div
          className={`btn btn-sm w-full text-xs justify-between btn-ghost cursor-default ${
            chatMenu === c.id ? "bg-base-300" : ""
          }`}
          onClick={() => handleChatClick(c.id)}
          onMouseEnter={() => setHoveredChat(c.id)}
          onMouseLeave={() => (chatMenu === c.id ? null : setHoveredChat(null))}
        >
          <p className="text-left w-3/4 truncate">{c.title}</p>
          <AnimatePresence>
            {hoveredChat === c.id && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onClick={() => chatClicked(c.id)}
                onMouseLeave={() =>
                  chatMenu === c.id ? null : setChatMenu(null)
                }
              >
                <Ellipsis size={16} className="w-8 h-6 cursor-pointer" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {chatMenu === c.id && (
        <div className="w-full" onMouseLeave={() => leaveChatMenu()}>
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
                      document.getElementById("rename_chat").showModal()
                    }
                  >
                    <Pen size={16} />
                  </div>
                </button>
                <dialog
                  id="rename_chat"
                  className="modal modal-bottom sm:modal-middle"
                >
                  <div className="modal-box">
                    <h3 className="font-bold text-lg">Rename the chat</h3>
                    <div className="divider"></div>
                    <p className="">
                      <label className="input input-bordered flex items-center gap-2">
                        <PenLine size={16} />
                        <input
                          type="text"
                          className="grow text-sm"
                          placeholder={c.title}
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                        />
                      </label>
                    </p>
                    <div className="modal-action w-full justify-center">
                      <button
                        className="btn btn-sm btn-outline btn-success mr-2"
                        onClick={async () => {
                          await renameChat(c.id, newTitle);
                          document.getElementById("rename_chat").close();
                          mutate("/api/get-chats/");
                        }}
                      >
                        Update
                      </button>
                      <button
                        className="btn btn-sm"
                        onClick={() =>
                          document.getElementById("rename_chat").close()
                        }
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </dialog>
              </div>
              <div className="w-full h-full hover:bg-base-200 p-1">
                <button
                  className="text-xs text-error flex flex-row items-center p-2"
                  onClick={() =>
                    document.getElementById("delete_chat").showModal()
                  }
                >
                  <div className="flex flex-row items-center">
                    <Trash2 size={16} />
                  </div>
                </button>
                <dialog
                  id="delete_chat"
                  className="modal modal-bottom sm:modal-middle"
                >
                  <div className="modal-box">
                    <h3 className="font-bold text-lg">Delete chat?</h3>
                    <div className="divider"></div>
                    <p>
                      This will delete
                      <span className="ml-1 font-bold">{c.title}</span>.
                    </p>
                    <div className="modal-action w-full justify-center">
                      <button
                        className="btn btn-sm btn-outline btn-error mr-2"
                        onClick={() => {
                          deleteChatsById(c.id);
                          document.getElementById("delete_chat").close();
                          window.location.href = "/";
                        }}
                      >
                        Delete
                      </button>
                      <button
                        className="btn btn-sm"
                        onClick={() =>
                          document.getElementById("delete_chat").close()
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
