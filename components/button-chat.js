import { MessagesSquare } from "lucide-react";

export default function ButtonChat({ setHasStarted, isLoading }) {
  return (
    <div>
      <div className="tooltip tooltip-right m-1" data-tip="Chat">
        <button
          className={`btn btn-outline btn-sm ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isLoading}
          onClick={() => setHasStarted(true)}
        >
          <MessagesSquare size={16} />
        </button>
      </div>
    </div>
  );
}
