import { useState, useEffect } from "react";
import api from "../../api/axios";

const MyGroups = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get("/advisor/projects");
        setProjects(res.data || []);
      } catch (err) {
        setError("Failed to load projects.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (loading) return <p className="text-gray-500">Loading…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold text-[#1f67a8] mb-4">
        My Groups (Assigned Projects)
      </h2>
      {projects.length === 0 ? (
        <p className="text-gray-500">No assigned projects.</p>
      ) : (
        <div className="space-y-4">
          {projects.map((p) => (
            <div
              key={p.project_id}
              className="bg-white rounded border p-4 shadow-sm"
            >
              <h3 className="font-semibold text-gray-800">{p.title}</h3>
              <p className="text-sm text-gray-500">
                Student: {p.student?.full_name || "—"}
              </p>
              <p className="text-sm text-gray-500">Status: {p.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyGroups;
