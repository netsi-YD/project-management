import { useState, useEffect } from "react";
import api from "../../api/axios";

const AdminDashboard = () => {
  const [overview, setOverview] = useState({
    total_users: 0,
    total_projects: 0,
    total_submissions: 0,
  });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, logsRes] = await Promise.all([
          api.get("/admin/overview"),
          api.get("/admin/activity-logs"),
        ]);
        setOverview(overviewRes.data);
        setLogs(logsRes.data?.data || logsRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p className="text-gray-500">Loading…</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-[#1f67a8]">
        Super Admin Dashboard
      </h2>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-500 uppercase">
            Total Users
          </h3>
          <p className="text-3xl font-bold text-[#1f67a8] mt-2">
            {overview.total_users}
          </p>
        </div>
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-500 uppercase">
            Total Projects
          </h3>
          <p className="text-3xl font-bold text-[#1f67a8] mt-2">
            {overview.total_projects}
          </p>
        </div>
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-500 uppercase">
            Total Submissions
          </h3>
          <p className="text-3xl font-bold text-[#1f67a8] mt-2">
            {overview.total_submissions}
          </p>
        </div>
      </div>

      {/* Login History */}
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <h3 className="font-semibold text-[#1f67a8] mb-4">Login History</h3>
        {logs.length === 0 ? (
          <p className="text-gray-500">No login history recorded.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b text-left">
              <tr>
                <th className="py-2">User</th>
                <th className="py-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.slice(0, 10).map((log, idx) => (
                <tr key={idx} className="border-b">
                  <td className="py-2">{log.user?.full_name || "System"}</td>
                  <td className="py-2">
                    {new Date(log.created_at).toLocaleString()}
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

export default AdminDashboard;
