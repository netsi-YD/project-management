import { useState, useEffect } from "react";

const StudentMessages = () => {
  const [tab, setTab] = useState("groups");
  // Group chat state
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMessages, setGroupMessages] = useState([]);
  const [newGroupMsg, setNewGroupMsg] = useState("");
  // Direct message state
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [directMessages, setDirectMessages] = useState([]);
  const [newDirectMsg, setNewDirectMsg] = useState("");

  const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  });

  // Fetch groups
  useEffect(() => {
    fetch("http://localhost:8000/api/groups", { headers: authHeaders() })
      .then((r) => r.json())
      .then((data) => setGroups(data || []))
      .catch(console.error);
  }, []);

  // Fetch contacts
  useEffect(() => {
    fetch("http://localhost:8000/api/student/contacts", {
      headers: authHeaders(),
    })
      .then((r) => r.json())
      .then((data) => {
        // Ensure contacts is always an array
        if (Array.isArray(data)) {
          setContacts(data);
        } else {
          console.warn("contacts response is not an array", data);
          setContacts([]);
        }
      })
      .catch((err) => {
        console.error("Failed to load contacts", err);
        setContacts([]);
      });
  }, []);

  // Group chat handlers
  const openGroupChat = (group) => {
    setSelectedGroup(group);
    fetch(`http://localhost:8000/api/groups/${group.group_id}/messages`, {
      headers: authHeaders(),
    })
      .then((r) => r.json())
      .then((data) => setGroupMessages(Array.isArray(data) ? data : []))
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
      setGroupMessages(Array.isArray(data) ? data : []);
    } catch {
      alert("Failed to send");
    }
  };

  // Direct message handlers
  const openDirectChat = (contact) => {
    setSelectedContact(contact);
    fetch(`http://localhost:8000/api/messages/direct/${contact.user_id}`, {
      headers: authHeaders(),
    })
      .then((r) => r.json())
      .then((data) => setDirectMessages(Array.isArray(data) ? data : []))
      .catch(() => setDirectMessages([]));
  };

  const sendDirectMessage = async () => {
    if (!newDirectMsg.trim() || !selectedContact) return;
    try {
      await fetch("http://localhost:8000/api/messages", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          receiver_id: selectedContact.user_id,
          message: newDirectMsg,
        }),
      });
      setNewDirectMsg("");
      const res = await fetch(
        `http://localhost:8000/api/messages/direct/${selectedContact.user_id}`,
        { headers: authHeaders() },
      );
      const data = await res.json();
      setDirectMessages(Array.isArray(data) ? data : []);
    } catch {
      alert("Failed to send");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Messages</h2>
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setTab("groups")}
          className={`px-4 py-2 rounded ${tab === "groups" ? "bg-[#1f67a8] text-white" : "bg-gray-200"}`}
        >
          Group Chats
        </button>
        <button
          onClick={() => setTab("direct")}
          className={`px-4 py-2 rounded ${tab === "direct" ? "bg-[#1f67a8] text-white" : "bg-gray-200"}`}
        >
          Direct Messages
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
                    {g.project_title} – Group {g.group_number}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {selectedGroup && (
            <div className="bg-white rounded-lg border p-4 shadow-sm">
              <h3 className="font-semibold text-[#1f67a8] mb-3">
                Chat: {selectedGroup.project_title} – Group{" "}
                {selectedGroup.group_number}
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
                    className={`border-b pb-2 cursor-pointer hover:text-[#1f67a8] flex justify-between items-center ${
                      selectedContact?.user_id === c.user_id
                        ? "text-[#1f67a8] font-semibold"
                        : ""
                    }`}
                    onClick={() => openDirectChat(c)}
                  >
                    <span>
                      {c.full_name}{" "}
                      <span className="text-xs text-gray-500">({c.type})</span>
                    </span>
                    <button
                      className="text-xs bg-[#1f67a8] text-white px-2 py-1 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDirectChat(c);
                      }}
                    >
                      Message
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {selectedContact && (
            <div className="bg-white rounded-lg border p-4 shadow-sm">
              <h3 className="font-semibold text-[#1f67a8] mb-3">
                Chat with {selectedContact.full_name}
              </h3>
              <div className="h-64 overflow-y-auto space-y-2 mb-4 border rounded p-2">
                {directMessages.length === 0 && (
                  <p className="text-gray-500">No messages yet.</p>
                )}
                {directMessages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${
                      m.sender_id === Number(localStorage.getItem("user_id"))
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`rounded p-2 max-w-[80%] ${
                        m.sender_id === Number(localStorage.getItem("user_id"))
                          ? "bg-blue-100"
                          : "bg-gray-100"
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

export default StudentMessages;
