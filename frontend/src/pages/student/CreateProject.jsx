import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const CreateProject = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [groupProject, setGroupProject] = useState(null); // project object
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const groupsRes = await api.get("/groups");
        const groups = groupsRes.data || [];
        // Find the group that has a project
        const linkedGroup = groups.find((g) => g.project_id);
        if (!linkedGroup) {
          setFetching(false);
          return;
        }

        const projectsRes = await api.get("/projects");
        const projects = projectsRes.data.projects || [];
        const existing = projects.find(
          (p) => p.project_id === linkedGroup.project_id,
        );
        if (existing) {
          setGroupProject(existing);
          setTitle(existing.title || "");
          setDescription(existing.description || "");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setMessage("❌ Project title is required.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      await api.put(`/projects/${groupProject.project_id}`, {
        title: title.trim(),
        description: description.trim(),
      });
      setMessage("✅ Project updated successfully.");
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to update project.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-6">Loading…</div>;

  // No project linked at all
  if (!groupProject) {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">My Project</h2>
        <div className="bg-white rounded-lg border p-6 shadow-sm text-center text-gray-500">
          <p>You have not submitted a proposal yet.</p>
          <button
            onClick={() => navigate("/student/upload-proposal")}
            className="mt-4 bg-[#1f67a8] text-white px-4 py-2 rounded"
          >
            Submit Proposal
          </button>
        </div>
      </div>
    );
  }

  // Project exists but not yet approved
  if (groupProject.status === "pending") {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">My Project</h2>
        <div className="bg-white rounded-lg border p-6 shadow-sm text-center">
          <p className="text-gray-500 mb-2">
            Your proposal is under review. You will be able to edit the project
            title once it is approved.
          </p>
          <p className="text-sm text-gray-400">
            Current title:{" "}
            <span className="font-medium">{groupProject.title}</span>
          </p>
        </div>
      </div>
    );
  }

  // Approved (or other active status) – allow editing
  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {groupProject.status === "approved" ? "Edit Project" : "My Project"}
      </h2>
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Enter project title"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description (optional)"
            />
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
            disabled={loading}
            className="w-full bg-[#1f67a8] text-white py-2 px-4 rounded-lg hover:bg-[#185a8c] transition-colors disabled:opacity-50"
          >
            {loading ? "Saving…" : "Update Project"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;
