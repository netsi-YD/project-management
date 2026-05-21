import { NavLink } from "react-router-dom";

const StaffSidebar = ({ user }) => {
  const advisorMenu = [
    { label: "Overview", path: "/staff" },
    { label: "Advisor Requests", path: "/staff/advisor-requests" },
    { label: "My Groups", path: "/staff/advisor-groups" },
    { label: "Messages", path: "/staff/messages" },
    { label: "Similarity Check", path: "/staff/similarity" },
  ];
  const examinerMenu = [
    { label: "Overview", path: "/staff" },
    { label: "Evaluate Projects", path: "/staff/evaluate" },
    { label: "Similarity Reports", path: "/staff/similarity" },
    { label: "Feedback", path: "/staff/examiner-feedback" }, // new item
  ];

  const coordinatorMenu = [
    { label: "Overview", path: "/staff" },
    { label: "Pending Proposals", path: "/staff/pending-proposals" },
    { label: "Assign Advisors", path: "/staff/assign-advisors" },
    { label: "Assign Examiners", path: "/staff/assign-examiners" },
    { label: "Manage Projects", path: "/staff/manage-projects" },
    { label: "Evaluations", path: "/staff/coordinator-groups" }, // renamed label
  ];

  const deptHeadMenu = [
    { label: "Overview", path: "/staff/dept-head-dashboard" },
    { label: "Department Projects", path: "/staff/dept-projects" },
    { label: "Evaluations", path: "/staff/dept-evaluations" },
    { label: "Archived Projects", path: "/staff/dept-archive" },
  ];

  const superAdminMenu = [
    { label: "Overview", path: "/staff/admin-dashboard" },
    { label: "Manage Users", path: "/staff/manage-users" },
    { label: "Approve Accounts", path: "/staff/approve-accounts" },
    { label: "Import Users", path: "/staff/import-users" },
    { label: "Schedule Programs", path: "/staff/schedules" },
    { label: "Project Status", path: "/staff/project-status-admin" },
    { label: "Archive Projects", path: "/staff/archive-projects" },
    { label: "Backup Data", path: "/staff/backup" },
  ];

  if (!user || !user.roles || user.roles.length === 0) {
    return (
      <aside className="w-64 bg-white border-r min-h-screen p-4 flex flex-col">
        <h2 className="text-xl font-semibold text-[#1f67a8] mb-6">
          UoG FYP Portal
        </h2>
        <p className="text-gray-400">No roles assigned.</p>
        <div className="mt-auto border-t pt-4">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("roles");
              window.location.href = "/login";
            }}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
          >
            Log out
          </button>
        </div>
      </aside>
    );
  }

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

  return (
    <aside className="w-64 bg-white border-r min-h-screen p-4 flex flex-col">
      <h2 className="text-xl font-semibold text-[#1f67a8] mb-6">
        UoG FYP Portal
      </h2>

      {user.roles.includes("Advisor") && renderSection("Advisor", advisorMenu)}
      {user.roles.includes("Examiner") &&
        renderSection("Examiner", examinerMenu)}
      {user.roles.includes("Project_Coordinator") &&
        renderSection("Coordinator", coordinatorMenu)}
      {user.roles.includes("Department_Head") &&
        renderSection("Department Head", deptHeadMenu)}
      {user.roles.includes("Super_Admin") &&
        renderSection("Super Admin", superAdminMenu)}

      <div className="mt-auto border-t pt-4">
        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("roles");
            window.location.href = "/login";
          }}
          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
        >
          Log out
        </button>
      </div>
    </aside>
  );
};

export default StaffSidebar;
