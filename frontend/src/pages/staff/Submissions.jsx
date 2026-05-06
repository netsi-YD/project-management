import { useState, useEffect } from "react";
import api from "../../api/axios";

const Submissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/advisor/submissions")
      .then((res) => setSubmissions(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading…</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold text-[#1f67a8] mb-4">Submissions</h2>
      {submissions.length === 0 ? (
        <p className="text-gray-500">No submissions yet.</p>
      ) : (
        <div className="space-y-3">
          {submissions.map((s) => (
            <div key={s.id} className="bg-white rounded border p-3 shadow-sm">
              <p className="font-medium">{s.project?.title}</p>
              <p className="text-sm text-gray-500">
                Type: {s.type} | Uploaded:{" "}
                {new Date(s.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Submissions;
