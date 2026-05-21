import { useState, useEffect } from "react";
import api from "../../api/axios";

const UploadProposal = () => {
  const [projects, setProjects] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Own projects
        const ownRes = await api.get("/projects");
        const ownProjects = ownRes.data.projects || [];

        // Group-linked projects (for teammates)
        const groupRes = await api.get("/groups");
        const groups = groupRes.data || [];
        const groupProjectIds = groups
          .filter((g) => g.project_id)
          .map((g) => g.project_id);

        // Merge: own projects + any group project not already in own list
        const ownIds = ownProjects.map((p) => p.project_id);
        const extraProjects = [];

        for (const gp of groups) {
          if (gp.project_id && !ownIds.includes(gp.project_id)) {
            // Build a minimal project object from group data
            extraProjects.push({
              project_id: gp.project_id,
              title: gp.project_title || `Project #${gp.project_id}`,
              status: null, // will show without status badge
            });
          }
        }

        const allProjects = [...ownProjects, ...extraProjects];
        setProjects(allProjects);

        // Existing submissions for the current user
        const subRes = await api.get("/submissions");
        setSubmissions(subRes.data || []);
      } catch (err) {
        console.error("Failed to load data:", err);
        setMessage("❌ Could not load your projects. Please try again.");
      } finally {
        setFetching(false);
      }
    };
    fetchAll();
  }, []);

  // Check if a proposal already exists for the selected project
  const existingProposal = submissions.find(
    (s) => s.project_id === parseInt(projectId) && s.type === "proposal",
  );

  const selectedProject = projects.find(
    (p) => p.project_id === parseInt(projectId),
  );

  // Block upload if proposal exists and project is not in revision
  const isBlocked = existingProposal && selectedProject?.status !== "revision";

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!projectId || !file) {
      setMessage("❌ Please select a project and a file.");
      return;
    }
    if (isBlocked) {
      setMessage(
        "❌ A proposal has already been submitted. Re-upload is only allowed when revision is requested.",
      );
      return;
    }

    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("project_id", projectId);
    formData.append("type", "proposal");

    try {
      await api.post("/submit", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage("✅ Proposal uploaded successfully!");
      setFile(null);
      setProjectId("");
      document.getElementById("file-upload").value = "";

      // Refresh submissions list
      const subRes = await api.get("/submissions");
      setSubmissions(subRes.data || []);
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

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Upload Proposal</h2>
      <div className="max-w-xl bg-white rounded-lg border p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Project selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Project
            </label>
            {fetching ? (
              <p className="text-gray-500 text-sm">Loading your projects…</p>
            ) : projects.length === 0 ? (
              <p className="text-sm text-gray-500 border border-gray-200 rounded-lg px-4 py-2 bg-gray-50">
                No projects found. Create a project first.
              </p>
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
                    {p.status ? ` (${p.status})` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Existing submission status */}
          {projectId && existingProposal && (
            <div
              className={`text-sm p-3 rounded-lg border ${
                selectedProject?.status === "revision"
                  ? "bg-yellow-50 border-yellow-300 text-yellow-800"
                  : "bg-blue-50 border-blue-200 text-blue-800"
              }`}
            >
              {selectedProject?.status === "revision" ? (
                <>
                  ⚠️ <strong>Revision requested.</strong> You can re-upload a
                  new proposal — the previous one will be replaced.
                </>
              ) : (
                <>
                  ✅ <strong>Proposal already submitted.</strong> Re-upload is
                  only available when revision is requested by your advisor or
                  coordinator.
                </>
              )}
            </div>
          )}

          {/* File input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Proposal File
            </label>
            <input
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              disabled={isBlocked}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Accepted: PDF, DOC, DOCX, ZIP (Max 10MB)
            </p>
          </div>

          {/* Message */}
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

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || fetching || isBlocked}
            className="w-full bg-blue-800 text-white py-2 px-4 rounded-lg hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Uploading…" : "Upload Proposal"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadProposal;
