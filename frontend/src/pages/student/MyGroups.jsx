import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const MyGroups = () => {
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ group_number: "", members: "" });
  const [formMsg, setFormMsg] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [addMemberInput, setAddMemberInput] = useState("");
  const [addMemberMsg, setAddMemberMsg] = useState("");

  // Direct message state
  const [contacts, setContacts] = useState([]);
  const [dmUser, setDmUser] = useState(null);
  const [dmMessages, setDmMessages] = useState([]);
  const [dmNewMsg, setDmNewMsg] = useState("");

  const fetchGroups = () => {
    api
      .get("/groups")
      .then((r) => setGroups(r.data))
      .catch((err) =>
        setError(
          "Failed to load groups: " +
            (err.response?.data?.message || err.message),
        ),
      );
  };

  const fetchContacts = () => {
    api
      .get("/student/contacts")
      .then((r) => setContacts(r.data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchGroups();
    fetchContacts();
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

    // Validate each campus ID
    const campusIdRegex = /^(GUR|GUE|GUS)\/\d{5}\/\d{2}$/;
    for (const id of ids) {
      if (!campusIdRegex.test(id)) {
        setFormMsg(
          `Invalid campus ID: "${id}". Use format: GUR/XXXXX/YY, GUE/XXXXX/YY, or GUS/XXXXX/YY with exactly 5 digits after the prefix.`,
        );
        return;
      }
    }

    try {
      await api.post("/groups", {
        group_number: form.group_number,
        members: ids,
      });
      setFormMsg("Group created!");
      setForm({ group_number: "", members: "" });
      fetchGroups();
    } catch (err) {
      setFormMsg(
        "Failed to create group: " +
          (err.response?.data?.message || err.message),
      );
    }
  };

  const openChat = (group) => {
    setSelectedGroup(group);
    setDmUser(null);
    setAddMemberInput("");
    setAddMemberMsg("");
    api
      .get(`/groups/${group.group_id}/messages`)
      .then((r) => setMessages(r.data))
      .catch(() => setMessages([]));
  };

  const sendMessage = async () => {
    if (!newMsg.trim() || !selectedGroup) return;
    try {
      await api.post("/messages", {
        group_id: selectedGroup.group_id,
        message: newMsg,
      });
      setNewMsg("");
      const { data } = await api.get(
        `/groups/${selectedGroup.group_id}/messages`,
      );
      setMessages(data);
    } catch {
      alert("Failed to send message");
    }
  };

  const handleAddMember = async () => {
    if (!addMemberInput.trim()) return;
    try {
      await api.post(`/groups/${selectedGroup.group_id}/add-member`, {
        student_identifier: addMemberInput.trim(),
      });
      setAddMemberMsg("Member added!");
      setAddMemberInput("");
      fetchGroups();
      fetchContacts();
    } catch (err) {
      setAddMemberMsg(
        "Failed: " + (err.response?.data?.message || err.message),
      );
    }
  };

  // Direct message handlers
  const openDM = (user) => {
    setDmUser(user);
    setSelectedGroup(null);
    setDmMessages([]);
    api
      .get(`/messages/direct/${user.user_id}`)
      .then((r) => setDmMessages(r.data))
      .catch(() => setDmMessages([]));
  };

  const sendDM = async () => {
    if (!dmNewMsg.trim() || !dmUser) return;
    try {
      await api.post("/messages", {
        receiver_id: dmUser.user_id,
        message: dmNewMsg,
      });
      setDmNewMsg("");
      const { data } = await api.get(`/messages/direct/${dmUser.user_id}`);
      setDmMessages(data);
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
              placeholder="e.g. GUR/00437/16, GUE/12345/78, GUS/00001/99"
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

      {/* Group list + Contacts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          {/* Groups */}
          <div className="bg-white rounded-lg border p-4 shadow-sm mb-6">
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
                    <div className="text-sm text-gray-600">
                      {g.project_title}
                    </div>
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

          {/* Direct Message contacts */}
          <div className="bg-white rounded-lg border p-4 shadow-sm">
            <h3 className="font-semibold text-[#1f67a8] mb-3">
              Direct Messages
            </h3>
            {contacts.length === 0 ? (
              <p className="text-gray-500">No contacts available.</p>
            ) : (
              <ul className="space-y-2">
                {contacts.map((c) => (
                  <li
                    key={c.user_id}
                    className="flex items-center justify-between border-b pb-2"
                  >
                    <div>
                      <span className="text-sm font-medium">{c.full_name}</span>
                      <span className="text-xs text-gray-400 ml-2 capitalize">
                        ({c.type})
                      </span>
                    </div>
                    <button
                      onClick={() => openDM(c)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      DM
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Chat panel (group or DM) */}
        {selectedGroup && (
          <div className="bg-white rounded-lg border p-4 shadow-sm">
            <h3 className="font-semibold text-[#1f67a8] mb-3">
              Chat: Group {selectedGroup.group_number}
            </h3>
            <div className="h-48 overflow-y-auto space-y-2 mb-4 border rounded p-2">
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
            <div className="mt-4 border-t pt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Add a student to this group
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={addMemberInput}
                  onChange={(e) => setAddMemberInput(e.target.value)}
                  placeholder="Campus ID or User ID"
                  className="flex-1 border rounded px-3 py-1 text-sm"
                />
                <button
                  onClick={handleAddMember}
                  className="bg-[#1f67a8] text-white px-3 py-1 rounded text-sm"
                >
                  Add
                </button>
              </div>
              {addMemberMsg && (
                <p
                  className={`text-xs mt-1 ${addMemberMsg.startsWith("Failed") ? "text-red-600" : "text-green-700"}`}
                >
                  {addMemberMsg}
                </p>
              )}
            </div>
          </div>
        )}

        {dmUser && (
          <div className="bg-white rounded-lg border p-4 shadow-sm">
            <h3 className="font-semibold text-[#1f67a8] mb-3">
              DM: {dmUser.full_name} ({dmUser.type})
            </h3>
            <div className="h-48 overflow-y-auto space-y-2 mb-4 border rounded p-2">
              {dmMessages.length === 0 && (
                <p className="text-gray-500">No messages yet.</p>
              )}
              {dmMessages.map((m) => (
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
                value={dmNewMsg}
                onChange={(e) => setDmNewMsg(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 border rounded px-3 py-1"
              />
              <button
                onClick={sendDM}
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
