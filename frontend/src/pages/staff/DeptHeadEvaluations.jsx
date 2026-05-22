import { useState, useEffect } from "react";
import api from "../../api/axios";

const DeptHeadEvaluations = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEvaluations = async () => {
    try {
      const res = await api.get("/dept-head/evaluations");
      setStudents(res.data);
    } catch (err) {
      setError("Failed to load evaluations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const computeTotal = (adv, exm) => {
    const a = parseFloat(adv) || 0;
    const e = parseFloat(exm) || 0;
    return (a + e).toFixed(1);
  };

  const handleSubmitToSIS = (studentId) => {
    // Placeholder – replace with actual API call if available
    alert(`Submit to SIS for student ID ${studentId} – feature coming soon.`);
  };

  if (loading) return <div className="p-4">Loading…</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-[#1f67a8] mb-6">
        Forwarded Evaluations
      </h2>
      {students.length === 0 ? (
        <p className="text-gray-500">No evaluations in your department yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Student Name</th>
                <th className="border p-2">Advisor (30%)</th>
                <th className="border p-2">Examiner (70%)</th>
                <th className="border p-2">Total (100%)</th>
                <th className="border p-2">Submit to SIS</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.student_id} className="hover:bg-gray-50">
                  <td className="border p-2 font-medium">{s.student_name}</td>
                  <td className="border p-2 text-center">
                    {s.advisor_total != null ? `${s.advisor_total}/30` : "—"}
                  </td>
                  <td className="border p-2 text-center">
                    {s.examiner_total != null ? `${s.examiner_total}/70` : "—"}
                  </td>
                  <td className="border p-2 text-center font-bold">
                    {s.advisor_total != null && s.examiner_total != null
                      ? `${computeTotal(s.advisor_total, s.examiner_total)}/100`
                      : "—"}
                  </td>
                  <td className="border p-2 text-center">
                    <button
                      onClick={() => handleSubmitToSIS(s.student_id)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                    >
                      Submit to SIS
                    </button>
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

export default DeptHeadEvaluations;
