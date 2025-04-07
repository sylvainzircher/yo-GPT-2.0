import React, { useEffect, useRef, useState } from "react";
import { Paperclip } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CustomGptBuilder() {
  const [showModal, setShowModal] = useState(false);
  const documentUploaderRef = useRef(null);
  const [files, setFiles] = useState(undefined);
  const fileInputRef = useRef(null);
  const router = useRouter();

  const toggleShowModal = () => {
    setShowModal(!showModal);
  };

  const handleClose = () => {
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    let totalSize = 0;
    e.preventDefault();
    for (let f of files) {
      totalSize += Number(f.size);
    }
    if (totalSize <= 20000000) {
      setShowModal(false);
      toast.success(`Uploaded successfully!`);
      router.push("/pdf");
    } else {
      toast.error(`The size has to be smaller than 20MB`);
    }
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
        className={`btn btn-square text-sm flex flex-row align-middle p-2 items-center ${
          showModal ? "btn-active btn-ghost" : "btn-ghost"
        }`}
        onClick={toggleShowModal}
      >
        <Paperclip size={16} />
      </button>
      {showModal && (
        <div className="card bg-base-100 shadow-xl overflow-y-auto fixed top-20 border border-neutral-content">
          <div className="card-body">
            <p className="font-bold text-md mb-3">Upload Document</p>
            <form onSubmit={(e) => handleSubmit(e)}>
              <fieldset className="fieldset">
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files) {
                      setFiles(e.target.files);
                    }
                  }}
                  className="file-input file-input-sm"
                  multiple
                  required
                  ref={fileInputRef}
                />
                <label className="fieldset-label ml-2">Max size 20MB</label>
              </fieldset>
              <div className="border-top mt-5 mb-2">
                <div>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm text-xs text-white"
                  >
                    Upload
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
