import { useState, useEffect } from "react";
import api from "../../api/axios";

const ProjectStatus = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get("/staff/projects");
        setProjects(res.data?.data || res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleStatusChange = async (projectId, newStatus) => {
    try {
      await api.put(`/admin/projects/${projectId}/status`, {
        status: newStatus,
      });
      const res = await api.get("/staff/projects");
      setProjects(res.data?.data || res.data || []);
    } catch (err) {
      alert("Failed to update status");
    }
  };

  if (loading) return <p className="text-gray-500">Loading…</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold text-[#1f67a8] mb-4">
        Project Status Management
      </h2>
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        {projects.length === 0 ? (
          <p className="text-gray-500">No projects found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b text-left">
              <tr>
                <th className="py-2">Project</th>
                <th className="py-2">Current Status</th>
                <th className="py-2">Change Status</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.project_id} className="border-b">
                  <td className="py-2">{p.title}</td>
                  <td className="py-2 capitalize">{p.status}</td>
                  <td className="py-2">
                    <select
                      defaultValue=""
                      onChange={(e) =>
                        e.target.value &&
                        handleStatusChange(p.project_id, e.target.value)
                      }
                      className="border rounded px-2 py-1"
                    >
                      <option value="" disabled>
                        Select status
                      </option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="revision">Revision</option>
                      <option value="submitted">Submitted</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ProjectStatus;
