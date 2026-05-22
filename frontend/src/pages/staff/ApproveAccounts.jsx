import { useState, useEffect } from "react";
import api from "../../api/axios";

const ApproveAccounts = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState({});
  const [selectedRoles, setSelectedRoles] = useState({}); // userId -> array of role IDs
  const [rolesList, setRolesList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, rolesRes] = await Promise.all([
          api.get("/admin/pending-accounts"),
          api.get("/roles"),
        ]);
        setUsers(usersRes.data || []);
        setRolesList(rolesRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRoleToggle = (userId, roleId) => {
    setSelectedRoles((prev) => {
      const current = prev[userId] || [];
      if (current.includes(roleId)) {
        return { ...prev, [userId]: current.filter((id) => id !== roleId) };
      } else {
        return { ...prev, [userId]: [...current, roleId] };
      }
    });
  };

  const handleApprove = async (userId) => {
    const pw = password[userId];
    const roles = selectedRoles[userId];
    if (!pw || pw.length < 6)
      return alert("Password must be at least 6 characters");
    if (!roles || roles.length === 0) return alert("Select at least one role");

    try {
      await api.put(`/admin/approve-account/${userId}`, {
        password: pw,
        roles: roles, // array of role IDs
      });
      // remove user from list
      setUsers(users.filter((u) => u.user_id !== userId));
    } catch (err) {
      alert("Approval failed");
    }
  };

  if (loading) return <p className="text-gray-500">Loading…</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold text-[#1f67a8] mb-4">
        Approve Accounts
      </h2>
      {users.length === 0 ? (
        <p className="text-gray-500">No pending accounts.</p>
      ) : (
        <div className="space-y-4">
          {users.map((u) => (
            <div
              key={u.user_id}
              className="bg-white border rounded-lg p-4 shadow-sm"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <p className="font-medium">{u.full_name}</p>
                  <p className="text-sm text-gray-500">{u.email}</p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">ID:</span>{" "}
                    {u.institution_id || "—"} &nbsp;
                    <span className="font-medium">Dept:</span>{" "}
                    {u.department || "—"} &nbsp;
                    <span className="font-medium">Requested:</span>{" "}
                    {u.requested_role || "—"}
                    {u.year_of_study && <span> ({u.year_of_study} year)</span>}
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  {/* Password field */}
                  <input
                    type="text"
                    placeholder="Set password"
                    value={password[u.user_id] || ""}
                    onChange={(e) =>
                      setPassword({ ...password, [u.user_id]: e.target.value })
                    }
                    className="border rounded px-2 py-1 w-40"
                  />
                  {/* Roles multi-select */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assign Role(s)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {rolesList.map((role) => (
                        <label
                          key={role.role_id}
                          className="flex items-center gap-1 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={(selectedRoles[u.user_id] || []).includes(
                              role.role_id,
                            )}
                            onChange={() =>
                              handleRoleToggle(u.user_id, role.role_id)
                            }
                            className="rounded border-gray-300 text-[#1f67a8]"
                          />
                          <span className="text-sm">{role.role_name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => handleApprove(u.user_id)}
                    className="bg-[#1f67a8] text-white px-3 py-1 rounded"
                  >
                    Approve
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApproveAccounts;
