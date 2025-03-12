import { Save } from "lucide-react";

export default function ButtonSaveChat({ chatStarted, isLoading, onClick }) {
  return (
    <div>
      {chatStarted && (
        <div className="tooltip tooltip-right" data-tip="Save">
          <button
            type="button"
            className={`btn btn-outline btn-sm ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isLoading}
            onClick={(e) => {
              e.stopPropagation();
              onClick(e);
            }}
          >
            <Save size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
