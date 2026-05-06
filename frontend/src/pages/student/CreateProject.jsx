import { useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

const CreateProject = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    preferred_advisor1: "",
    preferred_advisor2: "",
    preferred_advisor3: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      setError("Please fill in both title and description.");
      return;
    }
    setLoading(true);
    setError("");

    // Combine the three names into a single comma-separated string (or JSON)
    const names = [
      formData.preferred_advisor1,
      formData.preferred_advisor2,
      formData.preferred_advisor3,
    ]
      .filter((name) => name.trim() !== "")
      .join(", ");

    try {
      await api.post("/projects", {
        title: formData.title,
        description: formData.description,
        preferred_advisor_names: names, // save the list in the new column
      });
      navigate("/student/dashboard");
    } catch (err) {
      console.error("Create project error:", err);
      if (err.response?.data?.errors) {
        const msgs = Object.values(err.response.data.errors).flat().join(", ");
        setError(msgs);
      } else {
        setError("Failed to create project. Please try again.");
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

          {/* Preferred Advisor Names (up to 3) */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Preferred Advisors (up to 3 – optional)
            </label>
            <input
              type="text"
              name="preferred_advisor1"
              value={formData.preferred_advisor1}
              onChange={handleChange}
              placeholder="1st advisor name"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              name="preferred_advisor2"
              value={formData.preferred_advisor2}
              onChange={handleChange}
              placeholder="2nd advisor name"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              name="preferred_advisor3"
              value={formData.preferred_advisor3}
              onChange={handleChange}
              placeholder="3rd advisor name"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {error && (
            <div className="p-3 text-sm bg-red-50 text-red-800 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-800 text-white py-2 px-4 rounded-lg hover:bg-blue-900 transition-colors disabled:opacity-50"
          >
            {loading ? "Creating…" : "Create Project"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;
