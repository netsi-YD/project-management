import { useState, useEffect } from "react";
import api from "../../api/axios";

const DeptHeadDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, evalRes] = await Promise.all([
          api.get("/dept-head/projects"),
          api.get("/dept-head/evaluations"),
        ]);
        setProjects(projRes.data?.data || projRes.data || []);
        setEvaluations(evalRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p className="text-gray-500">Loading…</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-[#1f67a8]">
        Department Head Dashboard
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-500 uppercase">
            Department Projects
          </h3>
          <p className="text-3xl font-bold text-[#1f67a8] mt-2">
            {projects.length}
          </p>
        </div>
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-500 uppercase">
            Evaluations
          </h3>
          <p className="text-3xl font-bold text-[#1f67a8] mt-2">
            {evaluations.length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <h3 className="font-semibold text-[#1f67a8] mb-4">
          Recent Evaluations
        </h3>
        {evaluations.length === 0 ? (
          <p className="text-gray-500">No evaluations yet.</p>
        ) : (
          <ul className="space-y-2">
            {evaluations.slice(0, 5).map((ev) => (
              <li key={ev.id} className="border-b py-2 text-sm">
                {ev.project?.title} – {ev.evaluator_type}:{" "}
                {ev.total_marks ?? "—"}%
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DeptHeadDashboard;
