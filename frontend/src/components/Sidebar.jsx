import React from "react";

const Sidebar = ({ user }) => {
  // Define menu items by role
  const advisorMenu = [
    "Overview",
    "Advisor Requests",
    "My Groups",
    "Submissions",
    "Reviews",
    "Messages",
  ];

  const examinerMenu = [
    "Evaluate Projects",
    "Similarity Reports",
    "Final Grades",
  ];

  const coordinatorMenu = [
    "Pending Proposals",
    "Assign Advisors",
    "Assign Examiners",
    "Manage Projects",
  ];

  const superAdminMenu = [
    "Login History",
    "Manage Users",
    "Schedule Programs",
    "Project Status",
    "Archive Projects",
    "Backup Data",
  ];

  // If no user prop or no roles, return empty sidebar
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

  return (
    <aside className="w-64 bg-white border-r min-h-screen p-4">
      <h2 className="text-xl font-semibold text-[#1f67a8] mb-6">
        UoG FYP Portal
      </h2>

      <ul className="space-y-4 text-gray-700">
        {/* ADVISOR MENU */}
        {user.roles.includes("advisor") && (
          <div>
            <p className="text-sm font-semibold text-gray-400 mb-2">Advisor</p>
            {advisorMenu.map((item) => (
              <li
                key={item}
                className="hover:bg-blue-50 hover:text-[#1f67a8] px-3 py-2 rounded cursor-pointer"
              >
                {item}
              </li>
            ))}
          </div>
        )}

        {/* EXAMINER MENU */}
        {user.roles.includes("examiner") && (
          <div>
            <p className="text-sm font-semibold text-gray-400 mb-2">Examiner</p>
            {examinerMenu.map((item) => (
              <li
                key={item}
                className="hover:bg-blue-50 hover:text-[#1f67a8] px-3 py-2 rounded cursor-pointer"
              >
                {item}
              </li>
            ))}
          </div>
        )}

        {/* COORDINATOR MENU */}
        {user.roles.includes("coordinator") && (
          <div>
            <p className="text-sm font-semibold text-gray-400 mb-2">
              Coordinator
            </p>
            {coordinatorMenu.map((item) => (
              <li
                key={item}
                className="hover:bg-blue-50 hover:text-[#1f67a8] px-3 py-2 rounded cursor-pointer"
              >
                {item}
              </li>
            ))}
          </div>
        )}

        {/* SUPER ADMIN MENU */}
        {user.roles.includes("super_admin") && (
          <div>
            <p className="text-sm font-semibold text-gray-400 mb-2">
              Super Admin
            </p>
            {superAdminMenu.map((item) => (
              <li
                key={item}
                className="hover:bg-blue-50 hover:text-[#1f67a8] px-3 py-2 rounded cursor-pointer"
              >
                {item}
              </li>
            ))}
          </div>
        )}
      </ul>
    </aside>
  );
};

export default Sidebar;
