import { useState, useEffect } from "react";
import api from "../../api/axios";

const UploadFinalReport = () => {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingProjects, setFetchingProjects] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get("/projects");
        setProjects(res.data.projects || []);
      } catch (err) {
        console.error("Failed to load projects:", err);
        setMessage("Could not load your projects. Please try again.");
      } finally {
        setFetchingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!projectId || !file) {
      setMessage("Please select a project and a file.");
      return;
    }
    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("project_id", projectId);
    formData.append("type", "final"); // ← only difference

    try {
      await api.post("/submit", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage("✅ Final report uploaded successfully!");
      setFile(null);
      setProjectId("");
      document.getElementById("final-file-upload").value = "";
    } catch (err) {
      console.error("Upload error:", err);
      if (err.response?.data?.errors) {
        const errMsgs = Object.values(err.response.data.errors)
          .flat()
          .join(", ");
        setMessage(`❌ ${errMsgs}`);
      } else {
        setMessage("❌ Upload failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Upload Final Report
      </h2>
      <div className="max-w-xl bg-white rounded-lg border p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Project
            </label>
            {fetchingProjects ? (
              <p className="text-gray-500 text-sm">Loading your projects…</p>
            ) : (
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">-- Choose a project --</option>
                {projects.map((p) => (
                  <option key={p.project_id} value={p.project_id}>
                    {p.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Final Report File
            </label>
            <input
              id="final-file-upload"
              type="file"
              onChange={handleFileChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Accepted: PDF, DOC, DOCX, ZIP (Max 10MB)
            </p>
          </div>

          {message && (
            <div
              className={`text-sm p-3 rounded ${message.startsWith("✅") ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || fetchingProjects}
            className="w-full bg-blue-800 text-white py-2 px-4 rounded-lg hover:bg-blue-900 transition-colors disabled:opacity-50"
          >
            {loading ? "Uploading…" : "Upload Final Report"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadFinalReport;
