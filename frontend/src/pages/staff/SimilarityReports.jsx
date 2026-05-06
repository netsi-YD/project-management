import { useState } from "react";
import api from "../../api/axios";

const SimilarityReports = () => {
  const [similarityResult, setSimilarityResult] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedFileName(file.name);
    setUploading(true);
    setSimilarityResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/ai/similarity", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSimilarityResult(res.data);
    } catch (err) {
      alert("Similarity check failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-[#1f67a8] mb-4">
        Similarity Reports
      </h2>
      <div className="bg-white p-6 rounded shadow border-2 border-[#1f67a8]">
        <p className="text-gray-600 mb-4">
          Upload a document to check its similarity against your previous
          submissions.
        </p>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt,.pptx"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#1f67a8] file:text-white hover:file:bg-blue-700"
          />
          {uploading && (
            <div className="mt-4">
              <p className="text-blue-600">
                🤖 AI is analyzing your document...
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-[#1f67a8] h-2 rounded-full w-3/4 animate-pulse"></div>
              </div>
            </div>
          )}
          {similarityResult && !uploading && (
            <div
              className={`mt-4 p-4 rounded ${similarityResult.similarity_percentage > 30 ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"}`}
            >
              <p className="font-semibold">📊 Similarity Score:</p>
              <p
                className={`text-3xl font-bold ${similarityResult.similarity_percentage > 30 ? "text-red-600" : "text-green-600"}`}
              >
                {similarityResult.similarity_percentage}%
              </p>
              <p className="text-sm mt-1">{similarityResult.message}</p>
              <p className="text-xs text-gray-500 mt-2">
                File: {uploadedFileName}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimilarityReports;
