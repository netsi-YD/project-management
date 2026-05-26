import { useState, useEffect } from "react";
import api from "../../api/axios";

const UploadFinalReport = () => {
  const [groupProject, setGroupProject] = useState(null);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [fileError, setFileError] = useState("");

  const MAX_SIZE_MB = 20;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
  const ALLOWED_EXTENSIONS = [".doc", ".docx", ".ppt", ".pptx", ".zip"];

  useEffect(() => {
    const fetchGroupProject = async () => {
      try {
        const groupsRes = await api.get("/groups");
        const groups = groupsRes.data || [];
        const groupWithProject = groups.find((g) => g.project_id);
        if (!groupWithProject) {
          setFetching(false);
          return;
        }

        const projectRes = await api.get(
          `/projects/${groupWithProject.project_id}`,
        );
        const project = projectRes.data.project;
        if (project && project.status === "approved") {
          setGroupProject(project);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };
    fetchGroupProject();
  }, []);

  const validateFile = (selectedFile) => {
    if (!selectedFile) {
      setFileError("");
      return true;
    }
    const fileName = selectedFile.name.toLowerCase();
    const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) =>
      fileName.endsWith(ext),
    );
    if (!hasValidExtension) {
      setFileError(
        `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`,
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
    if (!groupProject) {
      setMessage("❌ No approved project linked to your group.");
      return;
    }
    if (!file) {
      setMessage("❌ Please select a valid final report file.");
      return;
    }

    setLoading(true);
    setMessage("");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("project_id", groupProject.project_id);
    formData.append("type", "final");

    try {
      await api.post("/submit", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage("✅ Final report uploaded successfully!");
      setFile(null);
      document.getElementById("final-file-upload").value = "";
    } catch (err) {
      console.error("Upload error:", err);
      const backendMsg =
        err.response?.data?.message ||
        Object.values(err.response?.data?.errors || {})
          .flat()
          .join(", ");
      setMessage(`❌ ${backendMsg || "Upload failed. Please try again."}`);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-6">Loading…</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Upload Final Report
      </h2>
      <div className="max-w-xl bg-white rounded-lg border p-6 shadow-sm">
        {!groupProject ? (
          <div className="text-sm p-4 rounded bg-yellow-50 border border-yellow-200 text-yellow-800 mb-4">
            No approved project linked to your group. Your proposal must be
            approved before you can submit the final report.
          </div>
        ) : (
          <div className="text-sm p-3 rounded bg-blue-50 border border-blue-200 text-blue-800 mb-4">
            Project: <strong>{groupProject.title}</strong> (Status:{" "}
            {groupProject.status})
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Final Report File (DOC, DOCX, PPT, PPTX, ZIP)
            </label>
            <input
              id="final-file-upload"
              type="file"
              accept=".doc,.docx,.ppt,.pptx,.zip"
              onChange={handleFileChange}
              disabled={!groupProject}
              className={`w-full border rounded-lg px-4 py-2 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${
                fileError ? "border-red-400" : "border-gray-300"
              }`}
            />
            <p className="text-xs text-gray-500 mt-1">
              Accepted: DOC, DOCX, PPT, PPTX, ZIP (Max {MAX_SIZE_MB} MB)
            </p>
            {fileError && (
              <p className="text-xs text-red-600 mt-1">{fileError}</p>
            )}
          </div>

          {message && (
            <div
              className={`text-sm p-3 rounded ${
                message.startsWith("✅")
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !groupProject || !file || !!fileError}
            className="w-full bg-[#1f67a8] text-white py-2 px-4 rounded-lg hover:bg-[#185a8c] transition-colors disabled:opacity-50"
          >
            {loading ? "Uploading…" : "Upload Final Report"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadFinalReport;
