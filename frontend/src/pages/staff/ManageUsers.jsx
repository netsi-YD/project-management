import { useState, useEffect } from "react";
import api from "../../api/axios";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [rolesList, setRolesList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, rolesRes] = await Promise.all([
          api.get("/admin/users"),
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

  const handleRoleChange = async (userId, roleId) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { roles: [roleId] });
      const res = await api.get("/admin/users");
      setUsers(res.data || []);
    } catch (err) {
      alert("Failed to update role");
    }
  };

  const handleDeactivate = async (userId) => {
    if (!window.confirm("Deactivate this user?")) return;
    try {
      await api.put(`/admin/users/${userId}/deactivate`);
      fetchUsers();
    } catch (err) {
      alert("Failed to deactivate user");
    }
  };

  const handleActivate = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/activate`);
      fetchUsers();
    } catch (err) {
      alert("Failed to activate user");
    }
  };

  if (loading) return <p className="text-gray-500">Loading…</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold text-[#1f67a8] mb-4">
        Manage Users
      </h2>
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        {users.length === 0 ? (
          <p className="text-gray-500">No users found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b text-left">
              <tr>
                <th className="py-2">Name</th>
                <th className="py-2">Email</th>
                <th className="py-2">Current Role</th>
                <th className="py-2">Change Role</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.user_id} className="border-b">
                  <td className="py-2">{u.full_name}</td>
                  <td className="py-2">{u.email}</td>

                  <td className="py-2">{(u.roles || []).join(", ")}</td>
                  <td className="py-2">
                    <select
                      defaultValue=""
                      onChange={(e) =>
                        e.target.value &&
                        handleRoleChange(u.user_id, e.target.value)
                      }
                      className="border rounded px-2 py-1"
                    >
                      <option value="" disabled>
                        Select role
                      </option>
                      {rolesList.map((r) => (
                        <option key={r.role_id} value={r.role_id}>
                          {r.role_name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        u.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {u.status || "active"}
                    </span>
                  </td>
                  <td className="py-2">
                    {u.status === "active" ? (
                      <button
                        onClick={() => handleDeactivate(u.user_id)}
                        className="text-red-600 hover:underline"
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => handleActivate(u.user_id)}
                        className="text-[#1f67a8] hover:underline"
                      >
                        Activate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;
