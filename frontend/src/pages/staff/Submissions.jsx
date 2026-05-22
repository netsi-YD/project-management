import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const Submissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/advisor/submissions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubmissions(res.data);
      } catch (err) {
        setError("Failed to load submissions");
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Student Submissions</h1>
      {submissions.length === 0 ? (
        <p>No submissions yet.</p>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="border p-4 rounded shadow flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex-1">
                <h3 className="font-semibold">{sub.project_title}</h3>
                <p className="text-sm text-gray-600">
                  Type: {sub.type} | Date:{" "}
                  {new Date(sub.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                {sub.file_url && (
                  <a
                    href={sub.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
                  >
                    View File
                  </a>
                )}
                <Link
                  to={`/staff/reviews?project_id=${sub.project_id}`}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm"
                >
                  Review
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Submissions;
