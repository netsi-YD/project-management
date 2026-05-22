import { useState } from "react";
import api from "../../api/axios";

const SimilarityCheck = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/ai/similarity", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
    } catch (err) {
      console.error("Similarity check error:", err);
      setError("Failed to check similarity. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Similarity Check
      </h2>
      <div className="max-w-xl bg-white rounded-lg border p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload your document (TXT format only)
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              accept=".pdf,.docx,.txt"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Accepted: TXT files only (Max 10MB)
            </p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1f67a8] text-white py-2 px-4 rounded-lg hover:bg-[#185a8c] transition-colors disabled:opacity-50"
          >
            {loading ? "Checking…" : "Check Similarity"}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 text-sm bg-red-50 text-red-800 rounded-lg">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-800">Result</h3>
            <p className="text-3xl font-bold text-blue-800 mt-2">
              {result.similarity_percentage}%
            </p>
            <p className="text-sm text-gray-600 mt-1">{result.message}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimilarityCheck;
