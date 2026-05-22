import { useState, useEffect } from "react";
import api from "../../api/axios";

const AdminDashboard = () => {
  const [overview, setOverview] = useState({
    total_users: 0,
    total_projects: 0,
    total_submissions: 0,
  });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, notiRes] = await Promise.all([
          api.get("/admin/overview"),
          api.get("/admin/notifications"),
        ]);
        setOverview(overviewRes.data);
        setNotifications(notiRes.data?.data || notiRes.data || []);
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

      {/* Notifications Feed */}
      {/* Notifications Feed */}
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[#1f67a8]">
            Recent Notifications
            {notifications.some((n) => !n.is_read) && (
              <span className="ml-2 bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
                {notifications.filter((n) => !n.is_read).length} unread
              </span>
            )}
          </h3>
          <button className="text-sm text-blue-600 hover:underline">
            View All
          </button>
        </div>

        {notifications.length === 0 ? (
          <p className="text-gray-500">No notifications.</p>
        ) : (
          <div className="space-y-3">
            {notifications.slice(0, 10).map((n) => (
              <div
                key={n.id}
                className={`p-3 rounded border ${
                  n.is_read ? "bg-gray-50" : "bg-blue-50 border-blue-200"
                }`}
              >
                <p className="text-sm">{n.message_content}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {n.user?.full_name || "System"} ·{" "}
                  {new Date(n.sent_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
