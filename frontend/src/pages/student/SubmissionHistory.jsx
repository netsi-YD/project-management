import { useState, useEffect } from "react";
import api from "../../api/axios";

const SubmissionHistory = () => {
  const [submissions, setSubmissions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [comments, setComments] = useState({}); // key = project_id
  const [loading, setLoading] = useState(true);
  const [activeProject, setActiveProject] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subRes, projRes] = await Promise.all([
          api.get("/submissions"),
          api.get("/projects"),
        ]);
        setSubmissions(subRes.data || []);
        setProjects(projRes.data.projects || []);
      } catch (err) {
        console.error("Failed to load data:", err);
        setMessage("Could not load your submissions.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const loadComments = async (projectId) => {
    if (comments[projectId]) return; // already loaded
    try {
      const res = await api.get(`/comments/${projectId}`);
      setComments((prev) => ({ ...prev, [projectId]: res.data || [] }));
    } catch (err) {
      console.error("Failed to load comments:", err);
    }
  };

  const toggleProject = (projectId) => {
    if (activeProject === projectId) {
      setActiveProject(null);
    } else {
      setActiveProject(projectId);
      loadComments(projectId);
    }
  };

  const getProjectTitle = (projectId) => {
    const proj = projects.find((p) => p.project_id === projectId);
    return proj ? proj.title : `Project #${projectId}`;
  };

  if (loading) {
    return <div className="p-8 text-gray-500">Loading your submissions…</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Submission History & Feedback
      </h2>

      {message && (
        <div className="mb-4 p-3 text-sm bg-red-50 text-red-800 rounded-lg">
          {message}
        </div>
      )}

      {submissions.length === 0 ? (
        <div className="text-gray-500">No submissions yet.</div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="bg-white rounded-lg border p-6 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {getProjectTitle(sub.project_id)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Type: <span className="capitalize">{sub.type}</span> ·
                    Uploaded: {new Date(sub.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => toggleProject(sub.project_id)}
                  className="text-sm text-[#1f67a8] hover:underline"
                >
                  {activeProject === sub.project_id
                    ? "Hide Feedback"
                    : "View Feedback"}
                </button>
              </div>

              {activeProject === sub.project_id && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Feedback & Comments
                  </h4>
                  {comments[sub.project_id]?.length > 0 ? (
                    <ul className="space-y-2">
                      {comments[sub.project_id].map((c) => (
                        <li
                          key={c.comment_id}
                          className="bg-blue-50 rounded p-3 text-sm"
                        >
                          <p className="text-gray-700">{c.body}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            — {c.user?.full_name || "Unknown"} ·{" "}
                            {new Date(c.created_at).toLocaleString()}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No feedback yet.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubmissionHistory;
