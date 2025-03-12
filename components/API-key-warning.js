export default function APIKeyWarning() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-2xl font-bold text-red-600 mb-4">API Key Missing</h1>
      <p className="text-gray-500">
        Please set your API key in the environment variables.
      </p>
      <p className="text-sm text-gray-400 mt-2">
        Add <code>NEXT_PUBLIC_FIREWORKS_API_KEY</code> to your <code>.env</code>{" "}
        file.
      </p>
    </div>
  );
}
