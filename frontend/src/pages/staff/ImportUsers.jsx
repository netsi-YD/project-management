import { useState } from "react";
import api from "../../api/axios";

const ImportUsers = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const allowedExtensions = [".csv", ".xlsx", ".xls"];
      const fileName = selectedFile.name.toLowerCase();
      const isValid = allowedExtensions.some((ext) => fileName.endsWith(ext));
      if (!isValid) {
        setError(
          "Invalid file type. Please upload a CSV or Excel file (.csv, .xlsx, .xls).",
        );
        setFile(null);
        return;
      }
      setError("");
      setFile(selectedFile);
    } else {
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a CSV or Excel file.");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/admin/import-users", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(res.data.message);
      setErrors(res.data.errors || []);
    } catch (err) {
      setError(err.response?.data?.message || "Import failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-[#1f67a8] mb-4">
        Import Users (Students & Instructors)
      </h2>
      <div className="bg-white rounded-lg border p-6 shadow-sm space-y-4">
        <p className="text-gray-600 text-sm">
          Upload a CSV or Excel file with columns:{" "}
          <strong>
            full_name, email, phone_number, gender, department, role,
            year_of_study
          </strong>{" "}
          (year only for students).
        </p>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#1f67a8] file:text-white hover:file:bg-blue-700"
          />
          <p className="text-xs text-gray-400 mt-2">
            Accepted: CSV, Excel (.xlsx, .xls)
          </p>
        </div>
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded">{error}</div>
        )}
        {message && (
          <div className="bg-green-50 text-green-700 p-3 rounded">
            {message}
          </div>
        )}
        {errors.length > 0 && (
          <div className="bg-yellow-50 text-yellow-800 p-3 rounded text-sm">
            <p className="font-semibold">Details:</p>
            <ul className="list-disc pl-5">
              {errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        )}
        <button
          onClick={handleUpload}
          disabled={loading}
          className="bg-[#1f67a8] text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Importing…" : "Import Users"}
        </button>
      </div>
    </div>
  );
};

export default ImportUsers;
