import { useState } from "react";
import api from "../../api/axios";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];
const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt"];
const MAX_SIZE_MB = 15;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const SimilarityCheck = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [fileError, setFileError] = useState("");

  const validateFile = (selectedFile) => {
    if (!selectedFile) {
      setFileError("");
      return true;
    }
    const fileName = selectedFile.name.toLowerCase();
    const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) =>
      fileName.endsWith(ext),
    );
    const hasValidType = ALLOWED_TYPES.includes(selectedFile.type);

    if (!hasValidExtension || !hasValidType) {
      setFileError(
        "Invalid file type. Only PDF, DOCX, and TXT files are allowed.",
      );
      return false;
    }
    if (selectedFile.size > MAX_SIZE_BYTES) {
      setFileError(`File size must be less than ${MAX_SIZE_MB} MB.`);
      return false;
    }
    setFileError("");
    return true;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const isValid = validateFile(selectedFile);
      setFile(isValid ? selectedFile : null);
    } else {
      setFile(null);
      setFileError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage("❌ Please select a file.");
      return;
    }

    setLoading(true);
    setMessage("");
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
      setMessage(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to check similarity.",
      );
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
              Upload Document (PDF, DOCX, TXT)
            </label>
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileChange}
              className={`w-full border rounded-lg px-4 py-2 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${
                fileError ? "border-red-400" : "border-gray-300"
              }`}
            />
            <p className="text-xs text-gray-500 mt-1">
              Accepted: PDF, DOCX, TXT (Max {MAX_SIZE_MB} MB)
            </p>
            {fileError && (
              <p className="text-xs text-red-600 mt-1">{fileError}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !file || !!fileError}
            className="w-full bg-[#1f67a8] text-white py-2 px-4 rounded-lg hover:bg-[#185a8c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Checking…" : "Check Similarity"}
          </button>
        </form>

        {message && (
          <div className="mt-4 p-3 text-sm bg-red-50 text-red-800 rounded-lg">
            {message}
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
