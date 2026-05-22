import { useState, useEffect } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

const CreateProject = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    group_id: "",
    preferred_advisor_ids: [],
  });
  const [advisors, setAdvisors] = useState([]);
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingAdvisors, setLoadingAdvisors] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(true);

  useEffect(() => {
    const fetchAdvisors = async () => {
      try {
        const res = await api.get("/advisors");
        setAdvisors(res.data || []);
      } catch (err) {
        console.error("Failed to load advisors:", err);
      } finally {
        setLoadingAdvisors(false);
      }
    };

    const fetchGroups = async () => {
      try {
        const res = await api.get("/groups");
        // Only show groups that are not yet linked to a project
        const unlinked = (res.data || []).filter((g) => !g.project_id);
        setGroups(unlinked);
      } catch (err) {
        console.error("Failed to load groups:", err);
      } finally {
        setLoadingGroups(false);
      }
    };

    fetchAdvisors();
    fetchGroups();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAdvisorToggle = (advisorId) => {
    const current = formData.preferred_advisor_ids;
    if (current.includes(advisorId)) {
      setFormData({
        ...formData,
        preferred_advisor_ids: current.filter((id) => id !== advisorId),
      });
    } else {
      if (current.length < 3) {
        setFormData({
          ...formData,
          preferred_advisor_ids: [...current, advisorId],
        });
      } else {
        alert("You can select up to 3 preferred advisors.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      setError("Please fill in both title and description.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      await api.post("/projects", {
        title: formData.title,
        description: formData.description,
        group_id: formData.group_id || null,
        preferred_advisor_ids: formData.preferred_advisor_ids,
      });
      navigate("/student/dashboard");
    } catch (err) {
      console.error("Create project error:", err);
      if (err.response?.data?.errors) {
        const msgs = Object.values(err.response.data.errors).flat().join(", ");
        setError(msgs);
      } else {
        setError(
          err.response?.data?.message ||
            "Failed to create project. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Create New Project
      </h2>
      <div className="max-w-xl bg-white rounded-lg border p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. AI-based Attendance System"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              placeholder="Describe your project..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Link to Group */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link to Group{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            {loadingGroups ? (
              <p className="text-gray-500 text-sm">Loading groups…</p>
            ) : groups.length === 0 ? (
              <p className="text-sm text-gray-500 border border-gray-200 rounded-lg px-4 py-2 bg-gray-50">
                No available groups — create a group first or your group is
                already linked to another project.
              </p>
            ) : (
              <select
                name="group_id"
                value={formData.group_id}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">— No group (solo project) —</option>
                {groups.map((g) => (
                  <option key={g.group_id} value={g.group_id}>
                    {g.group_number
                      ? `Group ${g.group_number}`
                      : `Group #${g.group_id}`}{" "}
                    ({g.members?.map((m) => m.full_name).join(", ")})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Preferred Advisors */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Advisors{" "}
              <span className="text-gray-400 font-normal">
                (select up to 3)
              </span>
            </label>
            {loadingAdvisors ? (
              <p className="text-gray-500 text-sm">Loading advisors…</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded p-3">
                {advisors.length === 0 && (
                  <p className="text-gray-500 text-sm col-span-full">
                    No advisors available.
                  </p>
                )}
                {advisors.map((a) => (
                  <label
                    key={a.advisor_id}
                    className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                      formData.preferred_advisor_ids.includes(a.advisor_id)
                        ? "border-[#1f67a8] bg-blue-50"
                        : "border-gray-300 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.preferred_advisor_ids.includes(
                        a.advisor_id,
                      )}
                      onChange={() => handleAdvisorToggle(a.advisor_id)}
                      className="rounded border-gray-400 text-[#1f67a8] focus:ring-[#1f67a8]"
                    />
                    <span className="text-sm font-medium text-gray-800">
                      {a.specialization} (ID: {a.advisor_id})
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 text-sm bg-red-50 text-red-800 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1f67a8] text-white py-2 px-4 rounded-lg hover:bg-[#185a8c] transition-colors disabled:opacity-50"
          >
            {loading ? "Creating…" : "Create Project"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;
