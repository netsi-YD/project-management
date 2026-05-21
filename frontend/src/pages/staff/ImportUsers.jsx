import { useState } from "react";
import api from "../../api/axios";

const ImportUsers = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a CSV file.");
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

  const downloadTemplate = () => {
    const csvContent =
      "data:text/csv;charset=utf-8,full_name,email,phone_number,gender,department,role,year_of_study\nJohn Doe,john@uog.edu,0911111111,male,Computer Science,Student,1st\nDr. Smith,smith@uog.edu,0922222222,female,Software Engineering,Advisor,\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "import_template.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-[#1f67a8] mb-4">
        Import Users (Students & Instructors)
      </h2>
      <div className="bg-white rounded-lg border p-6 shadow-sm space-y-4">
        <p className="text-gray-600 text-sm">
          Upload a CSV file with columns:{" "}
          <strong>
            full_name, email, phone_number, gender, department, role,
            year_of_study
          </strong>{" "}
          (year only for students).
        </p>
        <button
          onClick={downloadTemplate}
          className="text-[#1f67a8] underline text-sm"
        >
          Download Sample CSV
        </button>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#1f67a8] file:text-white hover:file:bg-blue-700"
          />
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
