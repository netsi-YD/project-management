import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [profileRes, projectsRes, notifRes] = await Promise.all([
          api.get("/student/profile"),
          api.get("/projects"),
          api.get("/notifications"),
        ]);
        setProfile(profileRes.data);
        setProjects(projectsRes.data.projects || []);
        // Ensure notifications is always an array
        const notifData = notifRes.data?.data || notifRes.data || [];
        setNotifications(Array.isArray(notifData) ? notifData : []);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500 text-lg animate-pulse">
          Loading dashboard…
        </div>
      </div>
    );
  }

  const totalProjects = projects.length;
  const submittedProjects = projects.filter(
    (p) => p.status !== "pending",
  ).length;
  const delayedProjects = projects.filter((p) => p.is_delayed).length;
  const hasAdvisor = projects.some(
    (p) => p.advisor_id && ![null, 0, "null"].includes(p.advisor_id),
  );
  const advisorStatus = hasAdvisor ? "Assigned" : "Not Assigned";
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div>
      {/* Welcome header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Welcome, {profile?.full_name || "Student"}
        </h2>
        <p className="text-gray-500">Here’s your project overview</p>
      </div>

      {/* Stat cards – staff style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-500 uppercase">
            Total Projects
          </h3>
          <p className="text-3xl font-bold text-[#1f67a8] mt-2">
            {totalProjects}
          </p>
        </div>

        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-500 uppercase">
            Submitted
          </h3>
          <p className="text-3xl font-bold text-[#1f67a8] mt-2">
            {submittedProjects}
          </p>
          {totalProjects > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              out of {totalProjects} projects
            </p>
          )}
        </div>

        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-500 uppercase">
            Advisor
          </h3>
          <p className="text-3xl font-bold text-[#1f67a8] mt-2">
            {advisorStatus}
          </p>
        </div>

        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-500 uppercase">
            Notifications
          </h3>
          <p className="text-3xl font-bold text-[#1f67a8] mt-2">
            {unreadCount}
          </p>
          <p className="text-xs text-gray-400 mt-1">unread</p>
        </div>
      </div>

      {/* Delayed projects warning (if any) */}
      {delayedProjects > 0 && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-8">
          <p className="text-red-700 text-sm font-medium">
            {delayedProjects} project{delayedProjects > 1 ? "s" : ""} delayed
          </p>
        </div>
      )}

      {/* Projects list preview */}
      {projects.length > 0 && (
        <div className="bg-white rounded-lg border p-6 shadow-sm mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Your Projects
          </h3>
          <ul className="divide-y">
            {projects.map((project) => (
              <li
                key={project.project_id}
                className="py-3 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-gray-700">{project.title}</p>
                  <p className="text-sm text-gray-500">
                    Status: {project.status}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    to={`/student/collaboration?project_id=${project.project_id}`}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Feedback
                  </Link>
                  {project.is_delayed && (
                    <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-full">
                      Delayed
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Notifications preview */}
      {notifications.length > 0 ? (
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Recent Notifications
          </h3>
          <ul className="space-y-2">
            {notifications.slice(0, 5).map((notif) => (
              <li
                key={notif.notification_id}
                className="flex items-start p-3 bg-blue-50 rounded-lg"
              >
                <span
                  className={`w-2 h-2 mt-2 rounded-full ${
                    notif.is_read ? "bg-gray-300" : "bg-blue-600"
                  }`}
                />
                <p className="ml-3 text-sm text-gray-700">
                  {notif.message_content}
                </p>
              </li>
            ))}
          </ul>
          {notifications.length > 5 && (
            <p className="text-sm text-gray-500 mt-2">
              +{notifications.length - 5} more notifications
            </p>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Notifications
          </h3>
          <p className="text-gray-500">No notifications yet.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
