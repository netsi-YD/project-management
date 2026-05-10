import { NavLink } from "react-router-dom";
import api from "../../api/axios";
import {
  HiOutlineHome,
  HiOutlineUpload,
  HiOutlineDocumentReport,
  HiOutlineUserAdd,
  HiOutlineCollection,
  HiOutlineArchive,
  HiOutlineUserGroup,
  HiOutlinePlusCircle,
  HiOutlineLightBulb,
  HiOutlineDocumentSearch,
} from "react-icons/hi";
import { useNavigate } from "react-router-dom";
const menuItems = [
  { to: "/student/dashboard", label: "Dashboard", icon: HiOutlineHome },
  {
    to: "/student/upload-proposal",
    label: "Upload Proposal",
    icon: HiOutlineUpload,
  },
  {
    to: "/student/upload-report",
    label: "Upload Final Report",
    icon: HiOutlineDocumentReport,
  },
  {
    to: "/student/request-advisor",
    label: "Request Advisor",
    icon: HiOutlineUserAdd,
  },
  {
    to: "/student/submissions",
    label: "Submission History & Feedback",
    icon: HiOutlineCollection,
  },
  {
    to: "/student/archive",
    label: "Archived Projects",
    icon: HiOutlineArchive,
  },
  {
    to: "/student/collaboration",
    label: "Advisor Collaboration",
    icon: HiOutlineUserGroup,
  },
  {
    to: "/student/create-project",
    label: "Create Project",
    icon: HiOutlinePlusCircle,
  },
  {
    to: "/student/ai-title-suggestions",
    label: "AI Title Suggestions",
    icon: HiOutlineLightBulb,
  },
  {
    to: "/student/similarity-check",
    label: "Similarity Check",
    icon: HiOutlineDocumentSearch,
  },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("roles");
    navigate("/login");
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        <h1 className="text-lg font-bold text-blue-800">UoG FYP Portal</h1>
      </div>
      <nav className="flex-1 py-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-800 border-r-4 border-blue-800"
                  : "text-gray-600 hover:bg-blue-50 hover:text-blue-800"
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.label}
          </NavLink>
        ))}
      </nav>
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

export default Sidebar;
