import { useState, useEffect } from "react";
import api from "../../api/axios";

const ManageProjects = () => {
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

  if (loading) return <p className="text-gray-500">Loading…</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold text-[#1f67a8] mb-4">
        Manage Projects
      </h2>
      <div className="space-y-3">
        {projects.length === 0 ? (
          <p className="text-gray-500">No projects found.</p>
        ) : (
          projects.map((p) => (
            <div
              key={p.project_id}
              className="bg-white rounded border p-3 shadow-sm"
            >
              <h3 className="font-medium">{p.title}</h3>
              <p className="text-sm text-gray-500">
                Student: {p.student?.full_name} | Status: {p.status}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageProjects;
