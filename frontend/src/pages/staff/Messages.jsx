import { useState, useEffect } from "react";

const Messages = () => {
  const [tab, setTab] = useState("groups");
  // Group chat state
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMessages, setGroupMessages] = useState([]);
  const [newGroupMsg, setNewGroupMsg] = useState("");
  // Direct message state
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [directMessages, setDirectMessages] = useState([]);
  const [newDirectMsg, setNewDirectMsg] = useState("");

  const token = () => localStorage.getItem("token");
  const authHeaders = () => ({
    Authorization: `Bearer ${token()}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  });

  // Fetch advisor's groups
  useEffect(() => {
    fetch("http://localhost:8000/api/advisor/groups", {
      headers: authHeaders(),
    })
      .then((r) => r.json())
      .then((data) => setGroups(data || []))
      .catch(console.error);
  }, []);

  // Fetch students for DM (reuse admin/users endpoint – adjust if needed)
  useEffect(() => {
    fetch("http://localhost:8000/api/admin/users", { headers: authHeaders() })
      .then((r) => r.json())
      .then((data) => {
        const students = (data || []).filter((u) =>
          u.roles?.includes("Student"),
        );
        setUsers(students);
      })
      .catch(() => {});
  }, []);

  // ─── Group chat handlers ────────────────────
  const openGroupChat = (group) => {
    setSelectedGroup(group);
    setSelectedUser(null);
    fetch(`http://localhost:8000/api/groups/${group.group_id}/messages`, {
      headers: authHeaders(),
    })
      .then((r) => r.json())
      .then((data) => setGroupMessages(data || []))
      .catch(() => setGroupMessages([]));
  };

  const sendGroupMessage = async () => {
    if (!newGroupMsg.trim() || !selectedGroup) return;
    try {
      await fetch("http://localhost:8000/api/messages", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          group_id: selectedGroup.group_id,
          message: newGroupMsg,
        }),
      });
      setNewGroupMsg("");
      const res = await fetch(
        `http://localhost:8000/api/groups/${selectedGroup.group_id}/messages`,
        { headers: authHeaders() },
      );
      const data = await res.json();
      setGroupMessages(data || []);
    } catch {
      alert("Failed to send");
    }
  };

  // ─── Direct message handlers ────────────────────
  const openDirectChat = (user) => {
    setSelectedUser(user);
    setSelectedGroup(null);
    fetchDirectMessages(user.user_id);
  };

  const fetchDirectMessages = (userId) => {
    fetch(`http://localhost:8000/api/messages/direct/${userId}`, {
      headers: authHeaders(),
    })
      .then((r) => r.json())
      .then((data) => setDirectMessages(data || []))
      .catch(() => setDirectMessages([]));
  };

  const sendDirectMessage = async () => {
    if (!newDirectMsg.trim() || !selectedUser) return;
    try {
      await fetch("http://localhost:8000/api/messages", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          receiver_id: selectedUser.user_id,
          message: newDirectMsg,
        }),
      });
      setNewDirectMsg("");
      fetchDirectMessages(selectedUser.user_id);
    } catch {
      alert("Failed to send");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-[#1f67a8] mb-4">Messages</h2>
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setTab("groups")}
          className={`px-4 py-2 rounded ${tab === "groups" ? "bg-[#1f67a8] text-white" : "bg-gray-200"}`}
        >
          Groups
        </button>
        <button
          onClick={() => setTab("direct")}
          className={`px-4 py-2 rounded ${tab === "direct" ? "bg-[#1f67a8] text-white" : "bg-gray-200"}`}
        >
          Direct Message
        </button>
      </div>

      {tab === "groups" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border p-4 shadow-sm">
            <h3 className="font-semibold text-[#1f67a8] mb-3">Your Groups</h3>
            {groups.length === 0 ? (
              <p className="text-gray-500">No groups yet.</p>
            ) : (
              <ul className="space-y-2">
                {groups.map((g) => (
                  <li
                    key={g.group_id}
                    className="border-b pb-2 cursor-pointer hover:text-[#1f67a8]"
                    onClick={() => openGroupChat(g)}
                  >
                    {g.project?.title || g.project_title} – Group{" "}
                    {g.group_number}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {selectedGroup && (
            <div className="bg-white rounded-lg border p-4 shadow-sm">
              <h3 className="font-semibold text-[#1f67a8] mb-3">
                Chat:{" "}
                {selectedGroup.project?.title || selectedGroup.project_title} –
                Group {selectedGroup.group_number}
              </h3>
              <div className="h-64 overflow-y-auto space-y-2 mb-4 border rounded p-2">
                {groupMessages.length === 0 && (
                  <p className="text-gray-500">No messages.</p>
                )}
                {groupMessages.map((m) => (
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
                  value={newGroupMsg}
                  onChange={(e) => setNewGroupMsg(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 border rounded px-3 py-1"
                />
                <button
                  onClick={sendGroupMessage}
                  className="bg-[#1f67a8] text-white px-4 py-1 rounded"
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "direct" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border p-4 shadow-sm">
            <h3 className="font-semibold text-[#1f67a8] mb-3">Students</h3>
            {users.length === 0 ? (
              <p className="text-gray-500">No students found.</p>
            ) : (
              <ul className="space-y-2">
                {users.map((u) => (
                  <li
                    key={u.user_id}
                    className="border-b pb-2 cursor-pointer hover:text-[#1f67a8]"
                    onClick={() => openDirectChat(u)}
                  >
                    {u.full_name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {selectedUser && (
            <div className="bg-white rounded-lg border p-4 shadow-sm">
              <h3 className="font-semibold text-[#1f67a8] mb-3">
                Chat with {selectedUser.full_name}
              </h3>
              <div className="h-64 overflow-y-auto space-y-2 mb-4 border rounded p-2">
                {directMessages.length === 0 && (
                  <p className="text-gray-500">No messages.</p>
                )}
                {directMessages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.sender_id === selectedUser.user_id ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`rounded p-2 max-w-[80%] ${
                        m.sender_id === selectedUser.user_id
                          ? "bg-gray-100"
                          : "bg-blue-50"
                      }`}
                    >
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
                  value={newDirectMsg}
                  onChange={(e) => setNewDirectMsg(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 border rounded px-3 py-1"
                />
                <button
                  onClick={sendDirectMessage}
                  className="bg-[#1f67a8] text-white px-4 py-1 rounded"
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Messages;
