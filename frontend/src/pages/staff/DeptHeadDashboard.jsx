import { useState, useEffect } from "react";
import api from "../../api/axios";

const DeptHeadDashboard = () => {
  const [stats, setStats] = useState({
    total_projects: 0,
    total_students: 0,
    archived_projects: 0,
  });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, notifRes] = await Promise.all([
          api.get("/dept-head/stats"),
          api.get("/dept-head/own-notifications"),
        ]);
        setStats(statsRes.data);
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
        Department Head Overview
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-500 uppercase">
            Total Projects
          </h3>
          <p className="text-3xl font-bold text-[#1f67a8] mt-2">
            {stats.total_projects}
          </p>
        </div>
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-500 uppercase">
            Students
          </h3>
          <p className="text-3xl font-bold text-[#1f67a8] mt-2">
            {stats.total_students}
          </p>
        </div>
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-500 uppercase">
            Archived Projects
          </h3>
          <p className="text-3xl font-bold text-[#1f67a8] mt-2">
            {stats.archived_projects}
          </p>
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

export default DeptHeadDashboard;
