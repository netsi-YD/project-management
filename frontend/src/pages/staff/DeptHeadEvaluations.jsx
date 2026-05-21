import { useState, useEffect } from "react";
import api from "../../api/axios";

const DeptHeadEvaluations = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dept-head/evaluations")
      .then((res) => setEvaluations(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading…</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold text-[#1f67a8] mb-4">
        Department Evaluations
      </h2>
      {evaluations.length === 0 ? (
        <p className="text-gray-500">No evaluations in your department yet.</p>
      ) : (
        <table className="w-full text-sm bg-white rounded border shadow-sm">
          <thead className="border-b text-left">
            <tr>
              <th className="py-2 px-4">Project</th>
              <th className="py-2 px-4">Evaluator</th>
              <th className="py-2 px-4">Marks</th>
              <th className="py-2 px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {evaluations.map((ev) => (
              <tr key={ev.id} className="border-b">
                <td className="py-2 px-4">{ev.project?.title}</td>
                <td className="py-2 px-4 capitalize">{ev.evaluator_type}</td>
                <td className="py-2 px-4">{ev.total_marks ?? "—"}</td>
                <td className="py-2 px-4 capitalize">{ev.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DeptHeadEvaluations;
