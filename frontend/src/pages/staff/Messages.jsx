import { useState, useEffect } from "react";
import api from "../../api/axios";

const Messages = () => {
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [selectedProject, setSelectedProject] = useState("");
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // Load advisor's projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get("/advisor/projects");
        setProjects(res.data || []);
      } catch (err) {
        console.error("Failed to load projects:", err);
        setError("Could not load projects.");
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  // Load comments when a project is selected
  useEffect(() => {
    if (!selectedProject) {
      setComments([]);
      return;
    }
    const fetchComments = async () => {
      setLoadingComments(true);
      try {
        const res = await api.get(`/comments/${selectedProject}`);
        setComments(res.data || []);
      } catch (err) {
        console.error("Failed to load comments:", err);
        setError("Could not load comments.");
      } finally {
        setLoadingComments(false);
      }
    };
    fetchComments();
  }, [selectedProject]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedProject) return;
    setSending(true);
    setError("");
    try {
      await api.post("/comments", {
        project_id: selectedProject,
        body: newComment.trim(),
      });
      // Refresh comments
      const res = await api.get(`/comments/${selectedProject}`);
      setComments(res.data || []);
      setNewComment("");
    } catch (err) {
      console.error("Post comment error:", err);
      setError("Failed to send comment.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-[#1f67a8] mb-4">
        Messages / Communication
      </h2>

      {/* Project selector */}
      <div className="bg-white rounded border p-4 shadow-sm mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Project
        </label>
        {loadingProjects ? (
          <p className="text-gray-500">Loading your projects…</p>
        ) : (
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          >
            <option value="">-- Choose a project --</option>
            {projects.map((p) => (
              <option key={p.project_id} value={p.project_id}>
                {p.title}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Conversation area */}
      {selectedProject && (
        <div className="bg-white rounded border p-4 shadow-sm">
          {loadingComments ? (
            <p className="text-gray-500">Loading messages…</p>
          ) : (
            <>
              <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
                {comments.length === 0 && (
                  <p className="text-gray-500">No messages yet.</p>
                )}
                {comments.map((c) => (
                  <div key={c.comment_id} className="flex">
                    <div className="bg-blue-50 rounded-lg p-3 max-w-[80%]">
                      <p className="text-sm text-gray-800">{c.body}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {c.user?.full_name || "Unknown"} ·{" "}
                        {new Date(c.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {error && (
                <div className="text-red-600 text-sm mb-2">{error}</div>
              )}

              <form onSubmit={handleSend} className="flex gap-3 items-end">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write your message…"
                  rows={2}
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
                  required
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="bg-[#1f67a8] text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {sending ? "Sending…" : "Send"}
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Messages;
