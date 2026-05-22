import { useState, useEffect } from "react";
import api from "../../api/axios";

const RequestAdvisor = () => {
  const [advisors, setAdvisors] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedAdvisor, setSelectedAdvisor] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [advRes, projRes] = await Promise.all([
          api.get("/advisors"),
          api.get("/projects"),
        ]);
        setAdvisors(advRes.data || []);
        setProjects(projRes.data?.projects || projRes.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAdvisor) {
      setStatus({ type: "error", text: "Please select an advisor." });
      return;
    }
    setLoading(true);
    setStatus({ type: "", text: "" });
    try {
      await api.post("/advisor/request", {
        advisor_id: selectedAdvisor,
        project_id: selectedProject || null,
        message,
      });
      setStatus({ type: "success", text: "Advisor request sent!" });
      setSelectedAdvisor("");
      setSelectedProject("");
      setMessage("");
    } catch (err) {
      setStatus({
        type: "error",
        text: err.response?.data?.message || "Failed to send request",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Request Advisor</h2>
      <div className="max-w-xl bg-white rounded-lg border p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Advisor
            </label>
            <select
              value={selectedAdvisor}
              onChange={(e) => setSelectedAdvisor(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
              required
            >
              <option value="">-- Choose an advisor --</option>
              {advisors.map((a) => (
                <option key={a.advisor_id} value={a.advisor_id}>
                  {a.specialization} ({a.education_level}) – {a.office_room}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Project (optional)
            </label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="">-- No project --</option>
              {projects.map((p) => (
                <option key={p.project_id} value={p.project_id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>
          {status.text && (
            <div
              className={`p-3 rounded ${status.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
            >
              {status.text}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-800 text-white py-2 px-4 rounded-lg hover:bg-blue-900"
          >
            {loading ? "Sending…" : "Send Request"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RequestAdvisor;
