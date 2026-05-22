import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const EvaluateProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/examiner/projects")
      .then((res) => setProjects(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-4">Loading…</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-[#1f67a8] mb-4">
        My Assigned Projects
      </h2>
      {projects.length === 0 ? (
        <p>No projects assigned yet.</p>
      ) : (
        <div className="space-y-3">
          {projects.map((p) => (
            <div
              key={p.project_id}
              className="border rounded p-3 flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{p.title}</p>
                <p className="text-sm text-gray-500">{p.student?.full_name}</p>
              </div>
              <Link
                to={`/staff/examiner/projects/${p.project_id}`}
                className="text-blue-600 hover:underline text-sm"
              >
                Evaluate
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EvaluateProjects;
