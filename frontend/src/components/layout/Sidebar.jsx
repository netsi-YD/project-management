import { NavLink } from "react-router-dom";
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
    </aside>
  );
};

export default Sidebar;
