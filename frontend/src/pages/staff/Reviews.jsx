import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../api/axios";

const Reviews = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(null); // project_id being reviewed
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState(""); // 'approved' or 'rejected'
  const [message, setMessage] = useState("");

  const [searchParams] = useSearchParams();
  const preselectedProjectId = searchParams.get("project_id");

  const fetchProjects = async () => {
    try {
      const res = await api.get("/advisor/projects");
      setProjects(res.data || []);
      // Auto-open the review form if a project_id was passed in the URL
      if (preselectedProjectId) {
        setReviewing(Number(preselectedProjectId));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSubmitReview = async (projectId) => {
    if (!comment.trim() || !status) {
      alert("Please provide a comment and select a status.");
      return;
    }
    try {
      await api.post("/advisor/review", {
        project_id: projectId,
        comment,
        status,
      });
      setMessage("Review submitted!");
      setReviewing(null);
      setComment("");
      setStatus("");
      fetchProjects(); // refresh list to show updated status
    } catch (err) {
      alert("Failed to submit review");
    }
  };

  if (loading) return <p className="text-gray-500">Loading…</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold text-[#1f67a8] mb-4">
        Project Reviews
      </h2>
      {message && (
        <p className="mb-4 text-green-700 bg-green-50 p-2 rounded">{message}</p>
      )}
      {projects.length === 0 ? (
        <p className="text-gray-500">No assigned projects.</p>
      ) : (
        <div className="space-y-4">
          {projects.map((p) => (
            <div
              key={p.project_id}
              className="bg-white rounded border p-4 shadow-sm"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{p.title}</h3>
                  <p className="text-sm text-gray-500">
                    Student: {p.student?.full_name}
                  </p>
                  <p className="text-sm text-gray-500">Status: {p.status}</p>
                </div>
                <button
                  onClick={() =>
                    setReviewing(
                      reviewing === p.project_id ? null : p.project_id,
                    )
                  }
                  className="bg-[#1f67a8] text-white px-3 py-1 rounded text-sm"
                >
                  {reviewing === p.project_id ? "Cancel" : "Review"}
                </button>
              </div>

              {reviewing === p.project_id && (
                <div className="mt-4 border-t pt-4 space-y-3">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write your review comment..."
                    className="w-full border rounded p-2"
                    rows={3}
                  />
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="border rounded p-2 w-full"
                  >
                    <option value="">-- Select status --</option>
                    <option value="approved">Approve</option>
                    <option value="rejected">Reject</option>
                  </select>
                  <button
                    onClick={() => handleSubmitReview(p.project_id)}
                    className="bg-[#1f67a8] text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Submit Review
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reviews;
