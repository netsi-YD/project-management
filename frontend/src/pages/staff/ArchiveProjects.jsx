import { useState, useEffect } from "react";
import api from "../../api/axios";

const ArchiveProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchArchived = async () => {
    try {
      const res = await api.get("/admin/archive-projects");
      setProjects(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchived();
  }, []);

  const handleArchive = async (projectId) => {
    try {
      await api.put(`/admin/projects/${projectId}/archive`);
      fetchArchived();
    } catch (err) {
      alert("Failed to archive");
    }
  };

  if (loading) return <p className="text-gray-500">Loading…</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold text-[#1f67a8] mb-4">
        Archive Approved Projects
      </h2>
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        {projects.length === 0 ? (
          <p className="text-gray-500">No projects to archive.</p>
        ) : (
          <ul className="space-y-2">
            {projects.map((p) => (
              <li
                key={p.project_id}
                className="flex justify-between border-b py-2"
              >
                <span>
                  {p.title} –{" "}
                  <span className="text-gray-500">{p.student?.full_name}</span>
                </span>
                <button
                  onClick={() => handleArchive(p.project_id)}
                  className="bg-[#1f67a8] text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  Archive
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ArchiveProjects;
