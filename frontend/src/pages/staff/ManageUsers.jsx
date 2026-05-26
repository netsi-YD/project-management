import { useState, useEffect } from "react";
import api from "../../api/axios";

const STAFF_ROLES = [
  "Advisor",
  "Examiner",
  "Project_Coordinator",
  "Department_Head",
  "Super_Admin",
];
const ALL_ROLES = ["Student", ...STAFF_ROLES];

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [openRoleEditor, setOpenRoleEditor] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data || []);
    } catch (err) {
      console.error("Failed to load users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const startEditRoles = (user) => {
    setOpenRoleEditor(user.user_id);
    setSelectedRoles([...user.roles]);
  };

  const cancelEditRoles = () => {
    setOpenRoleEditor(null);
    setSelectedRoles([]);
  };

  const toggleRole = (role) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const isStaffUser = (userRoles) => {
    return userRoles.some((r) => STAFF_ROLES.includes(r));
  };

  const saveRoles = async (userId) => {
    if (selectedRoles.length === 0) {
      setMessage("Please select at least one role.");
      return;
    }
    try {
      // Map role names to role IDs – we'll send names and let the backend resolve them,
      // or we can keep the existing backend that accepts role IDs.
      // Since the current backend route uses integer role IDs, we need to map names to IDs.
      // But the current dropdown already used hardcoded IDs. We'll keep the same hardcoded mapping.
      const roleMap = {
        Student: 1,
        Advisor: 2,
        Examiner: 3,
        Project_Coordinator: 4,
        Department_Head: 5,
        Super_Admin: 6,
      };
      const roleIds = selectedRoles.map((r) => roleMap[r]).filter(Boolean);

      await api.put(`/admin/users/${userId}/role`, { roles: roleIds });
      setMessage("Roles updated successfully.");
      setOpenRoleEditor(null);
      fetchUsers();
    } catch (err) {
      alert("Failed to update roles");
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const action = currentStatus === "active" ? "deactivate" : "activate";
    try {
      await api.put(`/admin/users/${userId}/${action}`);
      setMessage(`User ${action}d.`);
      fetchUsers();
    } catch (err) {
      alert("Failed to change status");
    }
  };

  if (loading) return <p className="p-4">Loading…</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-[#1f67a8] mb-6">Manage Users</h2>
      {message && (
        <p className="mb-4 text-green-700 bg-green-50 p-2 rounded">{message}</p>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Name</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Department</th>
              <th className="border p-2">Current Roles</th>
              <th className="border p-2">Change Roles</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const staff = isStaffUser(u.roles || []);
              const editing = openRoleEditor === u.user_id;
              const availableRoles = staff
                ? ALL_ROLES.filter((r) => r !== "Student")
                : ALL_ROLES;

              return (
                <tr key={u.user_id} className="hover:bg-gray-50">
                  <td className="border p-2 font-medium">{u.full_name}</td>
                  <td className="border p-2">{u.email}</td>
                  <td className="border p-2">{u.department || "—"}</td>
                  <td className="border p-2">{(u.roles || []).join(", ")}</td>
                  <td className="border p-2">
                    {editing ? (
                      <div className="space-y-1">
                        {availableRoles.map((role) => (
                          <label
                            key={role}
                            className="flex items-center gap-2 text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={selectedRoles.includes(role)}
                              onChange={() => toggleRole(role)}
                              className="rounded"
                            />
                            {role}
                          </label>
                        ))}
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => saveRoles(u.user_id)}
                            className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEditRoles}
                            className="bg-gray-400 text-white px-2 py-1 rounded text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditRoles(u)}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs hover:bg-blue-200"
                      >
                        Change Roles
                      </button>
                    )}
                  </td>
                  <td className="border p-2 text-center">
                    <button
                      onClick={() => handleToggleStatus(u.user_id, u.status)}
                      className={`px-3 py-1 rounded text-xs text-white ${
                        u.status === "active"
                          ? "bg-red-500 hover:bg-red-600"
                          : "bg-green-500 hover:bg-green-600"
                      }`}
                    >
                      {u.status === "active" ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageUsers;
