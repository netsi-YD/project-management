import { useState, useEffect } from "react";
import api from "../../api/axios";

const ExaminerFeedback = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");

  const fetchProjects = async () => {
    try {
      const res = await api.get("/examiner/projects");
      setProjects(res.data || []);
    } catch (err) {
      console.error("Failed to fetch projects", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSubmitFeedback = async (projectId) => {
    if (!comment.trim()) {
      alert("Please write a comment.");
      return;
    }
    try {
      await api.post("/comments", {
        project_id: projectId,
        body: comment,
      });
      setMessage("Feedback sent successfully!");
      setComment("");
      setSelectedProject(null);
    } catch (err) {
      alert("Failed to send feedback.");
    }
  };

  if (loading) return <p className="p-4">Loading…</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-[#1f67a8] mb-4">
        Send Feedback to Students
      </h2>
      {message && (
        <p className="mb-4 text-green-700 bg-green-50 p-2 rounded">{message}</p>
      )}
      {projects.length === 0 ? (
        <p>No assigned projects.</p>
      ) : (
        <div className="space-y-4">
          {projects.map((p) => (
            <div
              key={p.project_id}
              className="border rounded p-3 shadow-sm bg-white"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{p.title}</p>
                  <p className="text-sm text-gray-500">
                    Student: {p.student?.full_name}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setSelectedProject(
                      selectedProject === p.project_id ? null : p.project_id,
                    )
                  }
                  className="text-blue-600 hover:underline text-sm"
                >
                  {selectedProject === p.project_id
                    ? "Cancel"
                    : "Write Feedback"}
                </button>
              </div>

              {selectedProject === p.project_id && (
                <div className="mt-4 space-y-2">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Enter your feedback / comments…"
                    rows={3}
                    className="w-full border rounded p-2"
                  />
                  <button
                    onClick={() => handleSubmitFeedback(p.project_id)}
                    className="bg-[#1f67a8] text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Send Feedback
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

export default ExaminerFeedback;
