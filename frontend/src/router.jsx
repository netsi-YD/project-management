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
import AITitleSuggestions from "./pages/student/AITitleSuggestions";
import SimilarityCheck from "./pages/student/SimilarityCheck";
import StaffDashboard from "./pages/staff/Dashboard";
import StaffLayout from "./components/layout/StaffLayout";
import MyGroups from "./pages/staff/MyGroups";
import AdvisorRequests from "./pages/staff/AdvisorRequests";
import Submissions from "./pages/staff/Submissions";
import Reviews from "./pages/staff/Reviews";
import Messages from "./pages/staff/Messages";
import EvaluateProjects from "./pages/staff/EvaluateProjects";
import SimilarityReports from "./pages/staff/SimilarityReports";
import FinalGrades from "./pages/staff/FinalGrades";
import PendingProposals from "./pages/staff/PendingProposals";
import AssignAdvisors from "./pages/staff/AssignAdvisors";
import AssignExaminers from "./pages/staff/AssignExaminers";
import ManageProjects from "./pages/staff/ManageProjects";
import CoordinatorEvaluations from "./pages/staff/CoordinatorEvaluations";
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
      { path: "ai-title-suggestions", element: <AITitleSuggestions /> },
      { path: "similarity-check", element: <SimilarityCheck /> },
    ],
  },
  {
    path: "/staff",
    element: <StaffLayout />,
    children: [
      { index: true, element: <StaffDashboard /> },
      { path: "dashboard", element: <StaffDashboard /> },

      { path: "my-groups", element: <MyGroups /> },

      { path: "advisor-requests", element: <AdvisorRequests /> },
      { path: "submissions", element: <Submissions /> },
      { path: "reviews", element: <Reviews /> },
      { path: "messages", element: <Messages /> },
      { path: "similarity", element: <SimilarityReports /> },
      { path: "final-grades", element: <FinalGrades /> },
      { path: "pending-proposals", element: <PendingProposals /> },
      { path: "assign-advisors", element: <AssignAdvisors /> },
      { path: "assign-examiners", element: <AssignExaminers /> },
      { path: "manage-projects", element: <ManageProjects /> },
      { path: "evaluate", element: <EvaluateProjects /> }, // already exists, updated
      { path: "coordinator-evaluations", element: <CoordinatorEvaluations /> },
    ],
  },
]);

export default router;
