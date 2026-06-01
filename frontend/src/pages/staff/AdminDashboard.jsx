import { useState, useEffect } from "react";
import api from "../../api/axios";

const AdminDashboard = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, notifRes] = await Promise.all([
          api.get("/admin/overview"),
          api.get("/admin/notifications"),
        ]);
        setTotalUsers(overviewRes.data.total_users || 0);
        const notifData = notifRes.data?.data || notifRes.data || [];
        setNotifications(Array.isArray(notifData) ? notifData : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-4">Loading…</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-[#1f67a8] mb-6">
        Super Admin Overview
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-500 uppercase">
            Total Users
          </h3>
          <p className="text-3xl font-bold text-[#1f67a8] mt-2">{totalUsers}</p>
        </div>
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-500 uppercase">
            Notifications
          </h3>
          <p className="text-3xl font-bold text-[#1f67a8] mt-2">
            {notifications.length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4">
          Recent Notifications
        </h3>
        {notifications.length === 0 ? (
          <p className="text-gray-500">No notifications.</p>
        ) : (
          <ul className="space-y-2">
            {notifications.slice(0, 10).map((n) => (
              <li
                key={n.notification_id || n.id}
                className={`p-3 rounded border ${
                  n.is_read ? "bg-gray-50" : "bg-blue-50 border-blue-200"
                }`}
              >
                <p className="text-sm">{n.message_content}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {n.user?.full_name || "System"} ·{" "}
                  {new Date(n.sent_at || n.created_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
