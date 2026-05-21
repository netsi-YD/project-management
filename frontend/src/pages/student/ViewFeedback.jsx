import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios";

const ViewFeedback = () => {
  const { projectId } = useParams();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/comments/${projectId}`)
      .then((res) => setComments(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [projectId]);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link
        to="/student/my-groups"
        className="text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to My Groups
      </Link>
      <h1 className="text-2xl font-bold mb-4">Feedback & Comments</h1>
      {loading ? (
        <p>Loading…</p>
      ) : comments.length === 0 ? (
        <p className="text-gray-500">No feedback yet.</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="border rounded p-3 bg-white shadow-sm">
              <p className="text-sm text-gray-500">
                {c.user?.full_name || "Someone"} ·{" "}
                {new Date(c.created_at).toLocaleString()}
              </p>
              <p className="mt-1 whitespace-pre-wrap">{c.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ViewFeedback;
