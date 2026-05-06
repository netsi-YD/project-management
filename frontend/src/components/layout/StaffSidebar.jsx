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
    { label: "Overview", path: "/staff" },

    { label: "Login History", path: "/staff/login-history" },
    { label: "Manage Users", path: "/staff/manage-users" },
    { label: "Schedule Programs", path: "/staff/schedule" },
    { label: "Project Status", path: "/staff/project-status" },
    { label: "Archive Projects", path: "/staff/archive" },
    { label: "Backup Data", path: "/staff/backup" },
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
          className="w-full text-left px-6 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
        >
          Log out
        </button>
      </div>
    </aside>
  );
};

export default StaffSidebar;
