import { useState, useEffect } from "react";
import api from "../../api/axios";

const DeptHeadDashboard = () => {
  const [overview, setOverview] = useState({
    total_projects: 0,
    archived_projects: 0,
  });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, archiveRes, notifRes] = await Promise.all([
          api.get("/dept-head/projects"),
          api.get("/dept-head/archive-projects"),
          api.get("/dept-head/own-notifications"),
        ]);

        const projects = projectsRes.data?.data || projectsRes.data || [];
        const totalProjects = Array.isArray(projects) ? projects.length : 0;

        const archived = archiveRes.data || [];
        const archivedCount = Array.isArray(archived) ? archived.length : 0;

        setOverview({
          total_projects: totalProjects,
          archived_projects: archivedCount,
        });

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
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-[#1f67a8]">
        Department Head Dashboard
      </h2>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            Archived Projects
          </h3>
          <p className="text-3xl font-bold text-[#1f67a8] mt-2">
            {overview.archived_projects}
          </p>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <h3 className="font-semibold text-[#1f67a8] mb-4">
          Recent Notifications
        </h3>
        {notifications.length === 0 ? (
          <p className="text-gray-500">No notifications.</p>
        ) : (
          <div className="space-y-2">
            {notifications.slice(0, 10).map((n) => (
              <div
                key={n.notification_id || n.id}
                className={`p-3 rounded border ${
                  n.is_read ? "bg-gray-50" : "bg-blue-50 border-blue-200"
                }`}
              >
                <p className="text-sm">{n.message_content}</p>
                <p className="text-xs text-gray-500 mt-1">
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

export default DeptHeadDashboard;
