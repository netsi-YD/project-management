import { useState, useEffect } from "react";
import api from "../../api/axios";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

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

  const handleRoleChange = async (userId, newRole) => {
    if (!newRole) return;
    try {
      await api.put(`/admin/users/${userId}/role`, { roles: [newRole] });
      setMessage("Role updated successfully.");
      fetchUsers();
    } catch (err) {
      alert("Failed to update role");
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
              <th className="border p-2">Current Role</th>
              <th className="border p-2">Change Role</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.user_id} className="hover:bg-gray-50">
                <td className="border p-2 font-medium">{u.full_name}</td>
                <td className="border p-2">{u.email}</td>
                <td className="border p-2">{u.department || "—"}</td>
                <td className="border p-2">{u.roles?.join(", ")}</td>
                <td className="border p-2">
                  <select
                    defaultValue=""
                    onChange={(e) =>
                      handleRoleChange(u.user_id, e.target.value)
                    }
                    className="border rounded p-1 text-xs"
                  >
                    <option value="" disabled>
                      Select role
                    </option>
                    {/* You can list all available roles */}
                    <option value="1">Student</option>
                    <option value="2">Advisor</option>
                    <option value="3">Examiner</option>
                    <option value="4">Project_Coordinator</option>
                    <option value="5">Department_Head</option>
                    <option value="6">Super_Admin</option>
                  </select>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageUsers;
