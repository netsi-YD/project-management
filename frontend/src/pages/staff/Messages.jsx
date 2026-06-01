import { useState, useEffect } from "react";
import api from "../../api/axios";

const Messages = () => {
  const [tab, setTab] = useState("groups");

  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMessages, setGroupMessages] = useState([]);
  const [newGroupMsg, setNewGroupMsg] = useState("");

  const [contacts, setContacts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [directMessages, setDirectMessages] = useState([]);
  const [newDirectMsg, setNewDirectMsg] = useState("");

  useEffect(() => {
    // Fetch advisor's projects (which include group members with user_id)
    api
      .get("/advisor/projects")
      .then((res) => {
        const data = res.data || [];
        const safeArray = Array.isArray(data) ? data : [];
        setGroups(safeArray);

        // Build DM contacts from group members
        const contactMap = new Map();
        safeArray.forEach((project) => {
          if (project.group && project.group.members) {
            project.group.members.forEach((member) => {
              // member.user_id is the correct identifier for direct messages
              if (member.user_id && !contactMap.has(member.user_id)) {
                contactMap.set(member.user_id, {
                  user_id: member.user_id,
                  full_name: member.full_name,
                  type: "student",
                });
              }
            });
          }
        });
        setContacts(Array.from(contactMap.values()));
      })
      .catch(() => {
        setGroups([]);
        setContacts([]);
      });
  }, []);

  // ─── Group chat handlers ────────────────────
  const openGroupChat = (project) => {
    const groupId = project.group?.group_id;
    if (!groupId) return;

    setSelectedGroup(project);
    setSelectedUser(null);
    api
      .get(`/groups/${groupId}/messages`)
      .then((res) => setGroupMessages(res.data || []))
      .catch(() => setGroupMessages([]));
  };

  const sendGroupMessage = async () => {
    if (!newGroupMsg.trim() || !selectedGroup) return;
    const groupId = selectedGroup.group?.group_id;
    if (!groupId) return;
    try {
      await api.post("/messages", {
        group_id: groupId,
        message: newGroupMsg,
      });
      setNewGroupMsg("");
      const res = await api.get(`/groups/${groupId}/messages`);
      setGroupMessages(res.data || []);
    } catch {
      alert("Failed to send");
    }
  };

  // ─── Direct message handlers ────────────────────
  const openDirectChat = (contact) => {
    setSelectedUser(contact);
    setSelectedGroup(null);
    api
      .get(`/messages/direct/${contact.user_id}`)
      .then((res) => setDirectMessages(res.data || []))
      .catch(() => setDirectMessages([]));
  };

  const sendDirectMessage = async () => {
    if (!newDirectMsg.trim() || !selectedUser) return;
    try {
      await api.post("/messages", {
        receiver_id: selectedUser.user_id,
        message: newDirectMsg,
      });
      setNewDirectMsg("");
      // Reload the conversation immediately
      const res = await api.get(`/messages/direct/${selectedUser.user_id}`);
      setDirectMessages(res.data || []);
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
                {groups.map((project) => (
                  <li
                    key={project.project_id}
                    className="border-b pb-2 cursor-pointer hover:text-[#1f67a8]"
                    onClick={() => openGroupChat(project)}
                  >
                    {project.group
                      ? `Group ${project.group.group_number} – ${project.title}`
                      : project.title || `Project #${project.project_id}`}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {selectedGroup && (
            <div className="bg-white rounded-lg border p-4 shadow-sm">
              <h3 className="font-semibold text-[#1f67a8] mb-3">
                Chat:{" "}
                {selectedGroup.group
                  ? `Group ${selectedGroup.group.group_number}`
                  : selectedGroup.title}
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
            <h3 className="font-semibold text-[#1f67a8] mb-3">Contacts</h3>
            {contacts.length === 0 ? (
              <p className="text-gray-500">No contacts yet.</p>
            ) : (
              <ul className="space-y-2">
                {contacts.map((c) => (
                  <li
                    key={c.user_id}
                    className="border-b pb-2 cursor-pointer hover:text-[#1f67a8]"
                    onClick={() => openDirectChat(c)}
                  >
                    {c.full_name}{" "}
                    <span className="text-xs text-gray-400 capitalize">
                      ({c.type})
                    </span>
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
