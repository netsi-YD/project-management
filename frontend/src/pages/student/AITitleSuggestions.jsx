import { useState } from "react";
import api from "../../api/axios";

const AITitleSuggestions = () => {
  const [keyword, setKeyword] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!keyword.trim()) {
      setError("Please enter a keyword.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/ai/title-suggestions", {
        keyword: keyword.trim(),
      });
      setSuggestions(res.data.suggestions || []);
    } catch (err) {
      console.error("AI title suggestion error:", err);
      setError("Failed to generate suggestions. Please try again.");
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
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enter a keyword or area of interest
            </label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g., machine learning"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1f67a8] text-white py-2 px-4 rounded-lg hover:bg-[#185a8c] transition-colors disabled:opacity-50"
          >
            {loading ? "Generating…" : "Get Suggestions"}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 text-sm bg-red-50 text-red-800 rounded-lg">
            {error}
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Suggested Titles
            </h3>
            <ul className="space-y-2">
              {suggestions.map((s, i) => (
                <li
                  key={i}
                  className="p-3 bg-blue-50 rounded-lg text-sm text-gray-800"
                >
                  {s}
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
