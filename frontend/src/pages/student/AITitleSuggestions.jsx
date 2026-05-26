import { useState } from "react";
import api from "../../api/axios";

const AITitleSuggestions = () => {
  const [keyword, setKeyword] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!keyword.trim()) {
      setError("Please enter a keyword.");
      return;
    }
    setLoading(true);
    setError("");
    setSuggestions([]);
    setMessage("");

    try {
      const res = await api.post("/ai/title-suggestions", {
        keyword: keyword.trim(),
      });
      const data = res.data;
      if (data.suggestions && Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions);
        setMessage(
          "Suggestions are ranked from most relevant to least relevant.",
        );
      }
    } catch (err) {
      console.error("AI title suggestion error:", err);
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to get suggestions.";

      if (
        msg.toLowerCase().includes("rate limit") ||
        err.response?.status === 429
      ) {
        setError(
          "The AI service has a usage limit. Please wait a few minutes and try again.",
        );
      } else if (
        msg.toLowerCase().includes("limit") ||
        msg.toLowerCase().includes("quota")
      ) {
        setError(
          "The AI service has reached its request limit. Please try again later.",
        );
      } else {
        setError("Failed to get suggestions. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        AI Title Suggestions
      </h2>
      <div className="max-w-xl bg-white rounded-lg border p-6 shadow-sm">
        <p className="text-sm text-gray-500 mb-4">
          This feature uses an AI service that may have usage limits.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Keyword
            </label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              placeholder="Enter a keyword for project title ideas"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1f67a8] text-white py-2 px-4 rounded-lg hover:bg-[#185a8c] transition-colors disabled:opacity-50"
          >
            {loading ? "Getting Suggestions…" : "Get Suggestions"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-sm text-gray-600 italic">{message}</p>
        )}

        {error && (
          <div className="mt-4 text-sm p-3 rounded bg-red-50 text-red-800">
            {error}
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-gray-400 mb-2">
              Ranked from most relevant to least relevant
            </p>
            <ul className="space-y-2">
              {suggestions.map((title, index) => (
                <li
                  key={index}
                  className="p-3 border rounded-lg bg-gray-50 text-sm text-gray-700"
                >
                  {title}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AITitleSuggestions;
