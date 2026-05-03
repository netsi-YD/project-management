import { useState, useEffect } from "react";
import api from "../../api/axios";

const AdvisorCollaboration = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // Load student’s projects once
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get("/projects");
        setProjects(res.data.projects || []);
      } catch (err) {
        console.error("Failed to load projects:", err);
        setError("Could not load your projects.");
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  // Load comments whenever a different project is selected
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
        setError("Could not load conversation.");
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
      // Reload comments to show the new one
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
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Advisor Collaboration
      </h2>

      {/* Project selector */}
      <div className="bg-white rounded-lg border p-6 shadow-sm mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Project
        </label>
        {loadingProjects ? (
          <p className="text-gray-500 text-sm">Loading projects…</p>
        ) : (
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          {loadingComments ? (
            <p className="text-gray-500">Loading conversation…</p>
          ) : (
            <>
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {comments.length === 0 && (
                  <p className="text-gray-500">
                    No messages yet. Start the conversation!
                  </p>
                )}
                {comments.map((c) => (
                  <div
                    key={c.comment_id}
                    className={`flex ${c.user_id === /* you can't know here exactly, but assume alignment doesn't matter terribly */ "justify-start"}`}
                  >
                    <div className="bg-blue-50 rounded-lg p-3 max-w-[80%]">
                      <p className="text-sm text-gray-800">{c.body}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {c.user?.full_name || "Someone"} ·{" "}
                        {new Date(c.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {error && (
                <div className="mb-4 p-3 text-sm bg-red-50 text-red-800 rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleSend} className="flex gap-3 items-end">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write your message…"
                  rows={2}
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="bg-blue-800 text-white px-6 py-2 rounded-lg hover:bg-blue-900 transition-colors disabled:opacity-50"
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

export default AdvisorCollaboration;
