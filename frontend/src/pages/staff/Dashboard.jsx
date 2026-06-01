import { useState, useEffect } from "react";
import api from "../../api/axios";

const StaffDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [isCoordinator, setIsCoordinator] = useState(false);
  const [isAdvisor, setIsAdvisor] = useState(false);
  const [isExaminer, setIsExaminer] = useState(false);

  // Coordinator state
  const [totalProjects, setTotalProjects] = useState(0);
  const [pendingProposals, setPendingProposals] = useState(0);
  const [coordNotifications, setCoordNotifications] = useState([]);

  // Advisor state
  const [advisorGroups, setAdvisorGroups] = useState(0);
  const [advisorNotifications, setAdvisorNotifications] = useState([]);

  // Examiner state
  const [examinerProjects, setExaminerProjects] = useState(0);
  const [examinerNotifications, setExaminerNotifications] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const roles = JSON.parse(localStorage.getItem("roles") || "[]").map(
          (r) => r.toLowerCase(),
        );
        const coordinator = roles.includes("project_coordinator");
        const advisor = roles.includes("advisor");
        const examiner = roles.includes("examiner");
        setIsCoordinator(coordinator);
        setIsAdvisor(advisor);
        setIsExaminer(examiner);

        // Common notifications
        const notifRes = await api.get("/notifications");
        const notifs = notifRes.data?.data || notifRes.data || [];
        const safeNotifs = Array.isArray(notifs) ? notifs : [];

        if (coordinator) {
          const [projRes, pendRes] = await Promise.all([
            api.get("/staff/projects"),
            api.get("/coordinator/proposals"),
          ]);
          const projects = projRes.data?.data || projRes.data || [];
          setTotalProjects(
            projRes.data?.total ||
              (Array.isArray(projects) ? projects.length : 0),
          );
          const pending = pendRes.data || [];
          setPendingProposals(pending.length);
          setCoordNotifications(safeNotifs.slice(0, 5));
        }

        if (advisor) {
          const projRes = await api.get("/advisor/projects");
          const projects = projRes.data || [];
          setAdvisorGroups(Array.isArray(projects) ? projects.length : 0);
          setAdvisorNotifications(safeNotifs.slice(0, 5));
        }

        if (examiner) {
          const projRes = await api.get("/examiner/projects");
          const projects = projRes.data || [];
          setExaminerProjects(Array.isArray(projects) ? projects.length : 0);
          setExaminerNotifications(safeNotifs.slice(0, 5));
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-4">Loading…</div>;

  // Examiner View
  if (isExaminer) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Examiner Overview
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg border p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-500 uppercase">
              Assigned Projects
            </h3>
            <p className="text-3xl font-bold text-[#1f67a8] mt-2">
              {examinerProjects}
            </p>
          </div>
          <div className="bg-white rounded-lg border p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-500 uppercase">
              Notifications
            </h3>
            <p className="text-3xl font-bold text-[#1f67a8] mt-2">
              {examinerNotifications.length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">
            Recent Notifications
          </h3>
          {examinerNotifications.length === 0 ? (
            <p className="text-gray-500">No notifications.</p>
          ) : (
            <ul className="space-y-2">
              {examinerNotifications.map((n) => (
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
  }

  // Advisor View
  if (isAdvisor) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Advisor Overview
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg border p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-500 uppercase">
              My Groups
            </h3>
            <p className="text-3xl font-bold text-[#1f67a8] mt-2">
              {advisorGroups}
            </p>
          </div>
          <div className="bg-white rounded-lg border p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-500 uppercase">
              Notifications
            </h3>
            <p className="text-3xl font-bold text-[#1f67a8] mt-2">
              {advisorNotifications.length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">
            Recent Notifications
          </h3>
          {advisorNotifications.length === 0 ? (
            <p className="text-gray-500">No notifications.</p>
          ) : (
            <ul className="space-y-2">
              {advisorNotifications.map((n) => (
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
  }

  // Coordinator View
  if (isCoordinator) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Coordinator Overview
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              Pending Proposals
            </h3>
            <p className="text-3xl font-bold text-[#1f67a8] mt-2">
              {pendingProposals}
            </p>
          </div>
          <div className="bg-white rounded-lg border p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-500 uppercase">
              Notifications
            </h3>
            <p className="text-3xl font-bold text-[#1f67a8] mt-2">
              {coordNotifications.length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">
            Recent Notifications
          </h3>
          {coordNotifications.length === 0 ? (
            <p className="text-gray-500">No notifications.</p>
          ) : (
            <ul className="space-y-2">
              {coordNotifications.map((n) => (
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
  }

  // Fallback for other roles
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Staff Dashboard</h2>
      <p className="text-gray-500">
        Your dashboard is ready. Use the sidebar to navigate.
      </p>
    </div>
  );
};

export default StaffDashboard;
