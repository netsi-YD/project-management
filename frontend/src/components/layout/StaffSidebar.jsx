import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
const StaffSidebar = ({ user }) => {
  const advisorMenu = [
    { label: "Overview", path: "/staff" },
    { label: "Advisor Requests", path: "/staff/advisor-requests" },
    { label: "My Groups", path: "/staff/my-groups" },
    { label: "Submissions", path: "/staff/submissions" },
    { label: "Reviews", path: "/staff/reviews" },
    { label: "Messages", path: "/staff/messages" },
    { label: "Similarity Check", path: "/staff/similarity" },
    { label: "Evaluate Projects", path: "/staff/evaluate" },
  ];
  const examinerMenu = [
    { label: "Overview", path: "/staff" },

    { label: "Evaluate Projects", path: "/staff/evaluate" },
    { label: "Similarity Reports", path: "/staff/similarity" },
    { label: "Final Grades", path: "/staff/final-grades" },
  ];
  const coordinatorMenu = [
    { label: "Overview", path: "/staff" },

    { label: "Pending Proposals", path: "/staff/pending-proposals" },
    { label: "Assign Advisors", path: "/staff/assign-advisors" },
    { label: "Assign Examiners", path: "/staff/assign-examiners" },
    { label: "Manage Projects", path: "/staff/manage-projects" },
    { label: "Similarity Check", path: "/staff/similarity" },
  ];
  const superAdminMenu = [
    { label: "Overview", path: "/staff/admin-dashboard" },
    { label: "Manage Users", path: "/staff/manage-users" },
    { label: "Schedule Programs", path: "/staff/schedules" },
    { label: "Project Status", path: "/staff/project-status-admin" },
    { label: "Archive Projects", path: "/staff/archive-projects" },
    { label: "Backup Data", path: "/staff/backup" },
    { label: "Approve Accounts", path: "/staff/approve-accounts" },
  ];

  if (!user || !user.roles) {
    return (
      <aside className="w-64 bg-white border-r min-h-screen p-4">
        <h2 className="text-xl font-semibold text-[#1f67a8] mb-6">
          UoG FYP Portal
        </h2>
        <p className="text-gray-400">Loading...</p>
      </aside>
    );
  }

  // Helper to render a menu section
  const renderSection = (title, items) => (
    <div className="mb-4">
      <p className="text-sm font-semibold text-gray-400 mb-2">{title}</p>
      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `block px-3 py-2 rounded text-sm font-medium transition-colors ${
              isActive
                ? "bg-blue-50 text-[#1f67a8]"
                : "text-gray-700 hover:bg-blue-50 hover:text-[#1f67a8]"
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </div>
  );
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("roles");
    navigate("/login");
  };

  return (
    <aside className="w-64 bg-white border-r min-h-screen p-4">
      <h2 className="text-xl font-semibold text-[#1f67a8] mb-6">
        UoG FYP Portal
      </h2>
      {user.roles.includes("Advisor") && renderSection("Advisor", advisorMenu)}
      {user.roles.includes("Examiner") &&
        renderSection("Examiner", examinerMenu)}
      {user.roles.includes("Project_Coordinator") &&
        renderSection("Coordinator", coordinatorMenu)}
      {user.roles.includes("Super_Admin") &&
        renderSection("Super Admin", superAdminMenu)}

      <div className="mt-auto border-t pt-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 rounded transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Log out
        </button>
      </div>
    </aside>
  );
};

export default StaffSidebar;
