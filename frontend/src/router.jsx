import { createBrowserRouter } from "react-router-dom";

import PublicGuestHome from "./pages/guest/PublicGuestHome";
import GuestProjects from "./pages/guest/GuestProjects";
import AccessRequestForm from "./pages/guest/AccessRequestForm";
import Login from "./components/Login";
import UploadProposal from "./pages/student/UploadProposal";
import StudentLayout from "./components/layout/StudentLayout";
import Dashboard from "./pages/student/Dashboard";
import UploadFinalReport from "./pages/student/UploadFinalReport";
import RequestAdvisor from "./pages/student/RequestAdvisor";
import SubmissionHistory from "./pages/student/SubmissionHistory";
import ArchivedProjects from "./pages/student/ArchivedProjects";
import AdvisorCollaboration from "./pages/student/AdvisorCollaboration";
import CreateProject from "./pages/student/CreateProject";

const Placeholder = ({ title }) => (
  <div className="p-8 text-center text-gray-500">
    <h2 className="text-xl font-semibold">{title}</h2>
    <p className="mt-2">Coming soon</p>
  </div>
);

const router = createBrowserRouter([
  { path: "/", element: <PublicGuestHome /> },
  { path: "/login", element: <Login /> },
  { path: "/guest/projects", element: <GuestProjects /> },
  { path: "/guest/access-request", element: <AccessRequestForm /> },

  {
    path: "/student",
    element: <StudentLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "upload-proposal", element: <UploadProposal /> },
      { path: "upload-report", element: <UploadFinalReport /> },
      { path: "request-advisor", element: <RequestAdvisor /> },
      { path: "submissions", element: <SubmissionHistory /> },
      { path: "archive", element: <ArchivedProjects /> },
      { path: "collaboration", element: <AdvisorCollaboration /> },
      { path: "create-project", element: <CreateProject /> },
    ],
  },
]);

export default router;
