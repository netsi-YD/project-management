import { useState, useEffect } from "react";
import api from "../../api/axios";

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/activity-logs")
      .then((res) => setLogs(res.data.data || res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-4">Loading…</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-[#1f67a8] mb-6">Activity Log</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">User</th>
              <th className="border p-2">Action</th>
              <th className="border p-2">IP Address</th>
              <th className="border p-2">Date / Time</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="border p-2">
                  {log.user?.full_name || "System"}
                </td>
                <td className="border p-2">{log.action}</td>
                <td className="border p-2">{log.ip_address}</td>
                <td className="border p-2 text-xs">
                  {new Date(log.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActivityLogs;
