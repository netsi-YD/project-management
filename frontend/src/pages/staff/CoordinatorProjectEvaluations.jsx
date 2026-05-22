import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios";

const CoordinatorProjectEvaluations = () => {
  const { projectId } = useParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState({});

  const fetchEvaluations = async () => {
    try {
      const res = await api.get(`/coordinator/evaluations/${projectId}`);
      // Response is already grouped: { student_id, student_name, advisor, examiner }
      setStudents(res.data);
    } catch (err) {
      setError("Failed to load evaluations");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, [projectId]);

  const handleForward = async (evaluationId, type) => {
    try {
      await api.put(`/coordinator/forward-evaluation/${evaluationId}`);
      setMessages((prev) => ({
        ...prev,
        [evaluationId]: `✓ ${type} evaluation forwarded`,
      }));
      fetchEvaluations();
    } catch (err) {
      alert("Failed to forward");
    }
  };

  const computeOverall = (advisorTotal, examinerTotal) => {
    const adv = parseFloat(advisorTotal) || 0;
    const exm = parseFloat(examinerTotal) || 0;
    if (advisorTotal != null && examinerTotal != null) {
      return ((adv + exm) / 2).toFixed(1);
    }
    return advisorTotal ?? examinerTotal ?? "—";
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-6 max-w-full mx-auto">
      <Link
        to="/staff/coordinator-groups"
        className="text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to Groups
      </Link>
      <h1 className="text-2xl font-bold mb-4">Project Evaluations</h1>
      {students.length === 0 ? (
        <p>No evaluations submitted yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Student</th>
                <th className="border p-2">Advisor</th>
                <th className="border p-2">Advisor Total</th>
                <th className="border p-2">Examiner</th>
                <th className="border p-2">Examiner Total</th>
                <th className="border p-2">Overall Average</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => {
                const adv = s.advisor;
                const exm = s.examiner;
                const advisorTotal = adv?.total_marks ?? "—";
                const examinerTotal = exm?.total_marks ?? "—";
                const overall = computeOverall(
                  adv?.total_marks,
                  exm?.total_marks,
                );
                const advMsg = adv ? messages[adv.evaluation_id] : null;
                const exmMsg = exm ? messages[exm.evaluation_id] : null;

                return (
                  <tr key={s.student_id} className="hover:bg-gray-50">
                    <td className="border p-2 font-medium">{s.student_name}</td>
                    <td className="border p-2">{adv?.evaluator_name || "—"}</td>
                    <td className="border p-2 text-center">{advisorTotal}</td>
                    <td className="border p-2">{exm?.evaluator_name || "—"}</td>
                    <td className="border p-2 text-center">{examinerTotal}</td>
                    <td className="border p-2 text-center font-bold">
                      {overall}
                    </td>
                    <td className="border p-2 text-center">
                      {adv && adv.status !== "forwarded_to_dept_head" && (
                        <button
                          onClick={() =>
                            handleForward(adv.evaluation_id, "Advisor")
                          }
                          className="bg-blue-600 text-white px-2 py-1 rounded text-xs mr-1"
                        >
                          Forward Advisor
                        </button>
                      )}
                      {exm && exm.status !== "forwarded_to_dept_head" && (
                        <button
                          onClick={() =>
                            handleForward(exm.evaluation_id, "Examiner")
                          }
                          className="bg-green-600 text-white px-2 py-1 rounded text-xs mr-1"
                        >
                          Forward Examiner
                        </button>
                      )}
                      {advMsg && (
                        <p className="text-green-700 text-xs">{advMsg}</p>
                      )}
                      {exmMsg && (
                        <p className="text-green-700 text-xs">{exmMsg}</p>
                      )}
                      {(!adv || adv.status === "forwarded_to_dept_head") &&
                        (!exm || exm.status === "forwarded_to_dept_head") && (
                          <span className="text-xs text-gray-400">
                            All forwarded
                          </span>
                        )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CoordinatorProjectEvaluations;
