import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import StatCard from "../../components/ui/StatCard";
const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login"); // redirect if not logged in
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
        setNotifications(notifRes.data || []);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
        // If token is invalid, redirect to login
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

  // Compute summary stats
  const totalProjects = projects.length;
  const submittedProjects = projects.filter(
    (p) => p.status !== "pending",
  ).length;
  const delayedProjects = projects.filter((p) => p.is_delayed).length;
  const hasAdvisor = projects.some(
    (p) => p.advisor_id && ![null, 0, "null"].includes(p.advisor_id),
  );

  // Advisor status
  const advisorStatus = hasAdvisor ? "Assigned" : "Not Assigned";
  const advisorColor = hasAdvisor ? "green" : "yellow";

  // Current phase: if any project is 'approved', say 'Final Report', else 'Title Review'
  const currentPhase = projects.some((p) => p.status === "approved")
    ? "Final Report"
    : "Title Review";

  // Unread notifications count
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

      {/* Stat cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Project Status"
          value={`${totalProjects} Active`}
          subtext={
            delayedProjects > 0 ? `${delayedProjects} delayed` : "On track"
          }
          color={delayedProjects > 0 ? "red" : "blue"}
        />
        <StatCard
          title="Title Submitted"
          value={submittedProjects}
          subtext={`out of ${totalProjects} projects`}
          color="blue"
        />
        <StatCard title="Advisor" value={advisorStatus} color={advisorColor} />
        <StatCard
          title="Current Phase"
          value={currentPhase}
          subtext={totalProjects > 0 ? "Project in progress" : "No project yet"}
          color="blue"
        />
        <StatCard
          title="Notifications"
          value={unreadCount}
          subtext="unread"
          color={unreadCount > 0 ? "yellow" : "blue"}
        />
      </div>

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
                {project.is_delayed && (
                  <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-full">
                    Delayed
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Notifications preview */}
      {notifications.length > 0 && (
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
      )}
    </div>
  );
};

export default Dashboard;
