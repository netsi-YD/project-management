import { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // <-- new import

const MyGroups = () => {
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ group_number: "", members: "" });
  const [formMsg, setFormMsg] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");

  const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  });

  const fetchGroups = () => {
    fetch("http://localhost:8000/api/groups", { headers: authHeaders() })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => setGroups(data))
      .catch((err) => setError("Failed to load groups: " + err.message));
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const ids = form.members
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
    if (ids.length === 0) {
      setFormMsg("Please enter at least one student ID.");
      return;
    }
    try {
      const res = await fetch("http://localhost:8000/api/groups", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          group_number: form.group_number,
          members: ids,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
      setFormMsg("Group created!");
      setForm({ group_number: "", members: "" });
      fetchGroups();
    } catch (err) {
      setFormMsg("Failed to create group: " + err.message);
    }
  };

  const openChat = (group) => {
    setSelectedGroup(group);
    fetch(`http://localhost:8000/api/groups/${group.group_id}/messages`, {
      headers: authHeaders(),
    })
      .then((r) => r.json())
      .then((data) => setMessages(data))
      .catch(() => setMessages([]));
  };

  const sendMessage = async () => {
    if (!newMsg.trim() || !selectedGroup) return;
    try {
      await fetch("http://localhost:8000/api/messages", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          group_id: selectedGroup.group_id,
          message: newMsg,
        }),
      });
      setNewMsg("");
      const res = await fetch(
        `http://localhost:8000/api/groups/${selectedGroup.group_id}/messages`,
        { headers: authHeaders() },
      );
      const data = await res.json();
      setMessages(data);
    } catch {
      alert("Failed to send message");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">My Groups</h2>

      {/* Create Group Form */}
      <div className="bg-white rounded-lg border p-4 shadow-sm mb-6">
        <h3 className="font-semibold text-[#1f67a8] mb-3">
          Create a New Group
        </h3>
        <form onSubmit={handleCreate} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Group Number (optional)
            </label>
            <input
              type="text"
              value={form.group_number}
              onChange={(e) =>
                setForm({ ...form, group_number: e.target.value })
              }
              className="w-full border rounded px-3 py-1"
              placeholder="e.g. G-01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Student IDs (comma‑separated – campus IDs or numeric IDs)
            </label>
            <input
              type="text"
              value={form.members}
              onChange={(e) => setForm({ ...form, members: e.target.value })}
              placeholder="e.g. GUR/00437/16, GUR/05457/16"
              className="w-full border rounded px-3 py-1"
              required
            />
          </div>
          {formMsg && (
            <div
              className={`p-2 rounded text-sm ${formMsg.includes("created") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
            >
              {formMsg}
            </div>
          )}
          <button
            type="submit"
            className="bg-[#1f67a8] text-white px-4 py-2 rounded"
          >
            Create Group
          </button>
        </form>
      </div>

      {/* Group list + chat */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-4 shadow-sm">
          <h3 className="font-semibold text-[#1f67a8] mb-3">Your Groups</h3>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          {groups.length === 0 && !error && (
            <p className="text-gray-500">You are not in any group.</p>
          )}
          <ul className="space-y-2">
            {groups.map((g) => (
              <li key={g.group_id} className="border-b pb-2">
                <div
                  className="cursor-pointer hover:text-[#1f67a8]"
                  onClick={() => openChat(g)}
                >
                  Group {g.group_number}
                </div>
                {g.project_title && (
                  <div className="text-sm text-gray-600">{g.project_title}</div>
                )}
                <div className="text-sm text-gray-500">
                  Members: {g.members?.map((m) => m.full_name).join(", ")}
                </div>
                {g.project_id && (
                  <Link
                    to={`/student/feedback/${g.project_id}`}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View Feedback
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        {selectedGroup && (
          <div className="bg-white rounded-lg border p-4 shadow-sm">
            <h3 className="font-semibold text-[#1f67a8] mb-3">
              Chat: Group {selectedGroup.group_number}
            </h3>
            <div className="h-64 overflow-y-auto space-y-2 mb-4 border rounded p-2">
              {messages.length === 0 && (
                <p className="text-gray-500">No messages yet.</p>
              )}
              {messages.map((m) => (
                <div key={m.id} className="flex">
                  <div className="bg-blue-50 rounded p-2 max-w-[80%]">
                    <p className="text-sm text-gray-800">{m.message}</p>
                    <p className="text-xs text-gray-500">
                      {m.sender?.full_name} ·{" "}
                      {new Date(m.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 border rounded px-3 py-1"
              />
              <button
                onClick={sendMessage}
                className="bg-[#1f67a8] text-white px-4 py-1 rounded"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyGroups;
