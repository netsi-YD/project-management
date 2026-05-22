import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const DeptHeadProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchProjects = async () => {
    try {
      const res = await api.get("/dept-head/projects");
      const data = res.data?.data || res.data || [];
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleArchive = async (projectId) => {
    if (!window.confirm("Archive this project?")) return;
    try {
      await api.put(`/dept-head/projects/${projectId}/archive`);
      setMessage("Project archived.");
      fetchProjects();
    } catch (err) {
      alert("Failed to archive project");
    }
  };

  const handleUnarchive = async (projectId) => {
    if (!window.confirm("Remove this project from archived?")) return;
    try {
      await api.put(`/dept-head/projects/${projectId}/unarchive`);
      setMessage("Project unarchived.");
      fetchProjects();
    } catch (err) {
      alert("Failed to unarchive project");
    }
  };

  if (loading) return <p className="p-4">Loading…</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-[#1f67a8] mb-6">
        Department Projects
      </h2>
      {message && (
        <p className="mb-4 text-green-700 bg-green-50 p-2 rounded">{message}</p>
      )}
      {projects.length === 0 ? (
        <p>No projects in your department.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Title</th>
                <th className="border p-2">Student</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Set By</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.project_id} className="hover:bg-gray-50">
                  <td className="border p-2">
                    <Link
                      to={`/staff/dept/projects/${p.project_id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {p.title}
                    </Link>
                  </td>
                  <td className="border p-2">{p.student?.full_name}</td>
                  <td className="border p-2">{p.status}</td>
                  <td className="border p-2 text-sm">
                    {p.status_updated_by || "—"}
                  </td>
                  <td className="border p-2 text-center">
                    {!p.is_archived ? (
                      <button
                        onClick={() => handleArchive(p.project_id)}
                        className="bg-[#1f67a8] text-white px-3 py-1 rounded text-xs hover:bg-blue-800"
                      >
                        Archive
                      </button>
                    ) : (
                      <div className="flex justify-center gap-2">
                        <span className="text-gray-400 text-xs italic">
                          Archived
                        </span>
                        <button
                          onClick={() => handleUnarchive(p.project_id)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DeptHeadProjects;
