import { NavLink, useLocation, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  HiOutlineHome,
  HiOutlineUpload,
  HiOutlineDocumentReport,
  HiOutlineCollection,
  HiOutlineArchive,
  HiOutlineMail,
  HiOutlineUserGroup,
  HiOutlineLightBulb,
  HiOutlineDocumentSearch,
  HiOutlineChevronDown,
  HiOutlineChevronRight,
  HiOutlineFolder,
  HiOutlineSparkles,
  HiOutlineUsers,
  HiOutlineChat,
  HiOutlinePlusCircle,
} from "react-icons/hi";

const groups = [
  {
    label: "Dashboard",
    single: true,
    to: "/student/dashboard",
    icon: HiOutlineHome,
  },
  {
    label: "Projects",
    icon: HiOutlineFolder,
    children: [
      {
        to: "/student/create-project",
        label: "My Project",
        icon: HiOutlinePlusCircle,
      },
      {
        to: "/student/upload-proposal",
        label: "Submit Proposal",
        icon: HiOutlineUpload,
      },
      {
        to: "/student/upload-report",
        label: "Upload Final Report",
        icon: HiOutlineDocumentReport,
      },
      {
        to: "/student/submissions",
        label: "Submission History",
        icon: HiOutlineCollection,
      },
      {
        to: "/student/archive",
        label: "Archived Projects",
        icon: HiOutlineArchive,
      },
    ],
  },
  {
    label: "AI Tools",
    icon: HiOutlineSparkles,
    children: [
      {
        to: "/student/ai-title-suggestions",
        label: "Title Suggestions",
        icon: HiOutlineLightBulb,
      },
      {
        to: "/student/similarity-check",
        label: "Similarity Check",
        icon: HiOutlineDocumentSearch,
      },
    ],
  },
  {
    label: "Communication",
    icon: HiOutlineUsers,
    children: [
      {
        to: "/student/my-groups",
        label: "My Groups",
        icon: HiOutlineUserGroup,
      },
      { to: "/student/messages", label: "Messages", icon: HiOutlineMail },
      {
        to: "/student/collaboration",
        label: "Collaboration",
        icon: HiOutlineChat,
      },
    ],
  },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const initialOpen = groups.reduce((acc, g) => {
    if (
      !g.single &&
      g.children &&
      g.children.some((c) => location.pathname.startsWith(c.to))
    ) {
      acc[g.label] = true;
    }
    return acc;
  }, {});

  const [open, setOpen] = useState(initialOpen);

  const toggle = (label) =>
    setOpen((prev) => ({ ...prev, [label]: !prev[label] }));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("roles");
    navigate("/");
  };

  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
      <Link
        to="/"
        className="shrink-0 border-b border-gray-200 p-4 flex flex-col items-center hover:opacity-80"
      >
        <img
          src="/image/logo.png"
          alt="University of Gondar"
          className="h-16 w-auto mb-2"
        />
        <h1 className="text-xs font-semibold text-[#1f67a8] text-center leading-tight">
          UoG Final Year Project Management Portal
        </h1>
      </Link>

      <nav className="flex-1 py-3 overflow-y-auto">
        {groups.map((group) => {
          if (group.single) {
            return (
              <NavLink
                key={group.to}
                to={group.to}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-[#1f67a8] border-r-4 border-[#1f67a8]"
                      : "text-gray-700 hover:bg-blue-50 hover:text-[#1f67a8]"
                  }`
                }
              >
                <group.icon className="w-4 h-4 mr-2.5 shrink-0" />
                {group.label}
              </NavLink>
            );
          }

          const isGroupActive = group.children?.some((c) =>
            location.pathname.startsWith(c.to),
          );
          const isOpen = !!open[group.label];

          return (
            <div key={group.label}>
              <button
                onClick={() => toggle(group.label)}
                className={`w-full flex items-center px-4 py-2.5 text-sm font-medium transition-colors ${
                  isGroupActive
                    ? "text-[#1f67a8]"
                    : "text-gray-700 hover:text-[#1f67a8]"
                } hover:bg-blue-50`}
              >
                <group.icon className="w-4 h-4 mr-2.5 shrink-0" />
                <span className="flex-1 text-left">{group.label}</span>
                {isOpen ? (
                  <HiOutlineChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <HiOutlineChevronRight className="w-3.5 h-3.5" />
                )}
              </button>

              {isOpen && group.children && (
                <div className="ml-4 border-l border-gray-100">
                  {group.children.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center pl-4 pr-3 py-2 text-sm transition-colors ${
                          isActive
                            ? "bg-blue-50 text-[#1f67a8] border-r-4 border-[#1f67a8] font-medium"
                            : "text-gray-500 hover:bg-blue-50 hover:text-[#1f67a8]"
                        }`
                      }
                    >
                      <item.icon className="w-4 h-4 mr-2.5 shrink-0" />
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-gray-200 p-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 shrink-0"
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

export default Sidebar;
