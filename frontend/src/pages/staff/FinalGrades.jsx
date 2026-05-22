import { useState, useEffect } from "react";
import api from "../../api/axios";

const FinalGrades = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get("/examiner/projects");
        // Filter projects that have a grade (similarity_score) or status != pending
        const graded = (res.data || []).filter(
          (p) => p.similarity_score || p.status === "approved",
        );
        setProjects(graded);
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
        Final Grades
      </h2>
      {projects.length === 0 ? (
        <p className="text-gray-500">No graded projects yet.</p>
      ) : (
        <div className="space-y-3">
          {projects.map((p) => (
            <div
              key={p.project_id}
              className="bg-white rounded border p-3 shadow-sm flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{p.title}</p>
                <p className="text-sm text-gray-500">
                  Student: {p.student?.full_name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-[#1f67a8]">
                  {p.similarity_score ?? "—"}%
                </p>
                <p className="text-sm text-gray-500">{p.status}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FinalGrades;
