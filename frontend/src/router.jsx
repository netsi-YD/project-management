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
import AdminDashboard from "./pages/staff/AdminDashboard";
import ManageUsers from "./pages/staff/ManageUsers";
import Schedules from "./pages/staff/Schedules";
import ProjectStatusAdmin from "./pages/staff/ProjectStatus";
import ArchiveProjects from "./pages/staff/ArchiveProjects";
import BackupData from "./pages/staff/BackupData";
import ApproveAccounts from "./pages/staff/ApproveAccounts";
import ImportUsers from "./pages/staff/ImportUsers";
import AdvisorRequestsPage from "./pages/staff/AdvisorRequestsPage";
import CoordinatorGroups from "./pages/staff/CoordinatorGroups";
import StudentMessages from "./pages/student/StudentMessages";
import MyGroups from "./pages/student/MyGroups";
import DeptHeadDashboard from "./pages/staff/DeptHeadDashboard";
import DeptHeadArchive from "./pages/staff/DeptHeadArchive";
import ProjectReport from "./pages/staff/ProjectReport";
import DeptHeadProjects from "./pages/staff/DeptHeadProjects";
import DeptHeadEvaluations from "./pages/staff/DeptHeadEvaluations";
import AdvisorGroups from "./pages/staff/AdvisorGroups";
import AdvisorProjectDetail from "./pages/staff/AdvisorProjectDetail";
import CoordinatorProjectEvaluations from "./pages/staff/CoordinatorProjectEvaluations";
import ExaminerProjectDetail from "./pages/staff/ExaminerProjectDetail";
import ExaminerFeedback from "./pages/staff/ExaminerFeedback";
import ViewFeedback from "./pages/student/ViewFeedback";
import DeptHeadProjectDetail from "./pages/staff/DeptHeadProjectDetail";
import ActivityLogs from "./pages/staff/ActivityLogs";
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
      { path: "my-groups", element: <MyGroups /> },
      { path: "messages", element: <StudentMessages /> },
      { path: "feedback/:projectId", element: <ViewFeedback /> },
    ],
  },
  {
    path: "/staff",
    element: <StaffLayout />,
    children: [
      { index: true, element: <StaffDashboard /> },
      { path: "dashboard", element: <StaffDashboard /> },
      { path: "submissions", element: <Submissions /> },
      { path: "reviews", element: <Reviews /> },
      { path: "messages", element: <Messages /> },
      { path: "similarity", element: <SimilarityReports /> },
      { path: "final-grades", element: <FinalGrades /> },
      { path: "pending-proposals", element: <PendingProposals /> },
      { path: "assign-advisors", element: <AssignAdvisors /> },
      { path: "assign-examiners", element: <AssignExaminers /> },
      { path: "manage-projects", element: <ManageProjects /> },
      { path: "evaluate", element: <EvaluateProjects /> },
      { path: "coordinator-evaluations", element: <CoordinatorEvaluations /> },
      { path: "admin-dashboard", element: <AdminDashboard /> },
      { path: "manage-users", element: <ManageUsers /> },
      { path: "schedules", element: <Schedules /> },
      { path: "project-status-admin", element: <ProjectStatusAdmin /> },
      { path: "archive-projects", element: <ArchiveProjects /> },
      { path: "backup", element: <BackupData /> },
      { path: "approve-accounts", element: <ApproveAccounts /> },
      { path: "import-users", element: <ImportUsers /> },
      { path: "advisor-requests", element: <AdvisorRequestsPage /> },
      { path: "coordinator-groups", element: <CoordinatorGroups /> },
      { path: "dept-head-dashboard", element: <DeptHeadDashboard /> },
      { path: "dept-projects", element: <DeptHeadProjects /> },
      { path: "dept-evaluations", element: <DeptHeadEvaluations /> },
      { path: "dept-archive", element: <DeptHeadArchive /> },
      { path: "project-report/:projectId", element: <ProjectReport /> },
      { path: "advisor-groups", element: <AdvisorGroups /> },
      { path: "examiner-feedback", element: <ExaminerFeedback /> },
      { path: "dept/projects/:projectId", element: <DeptHeadProjectDetail /> },
      { path: "dept-projects", element: <DeptHeadProjects /> }, // ensure it's correct
      { path: "dept-archive", element: <DeptHeadArchive /> },
      {
        path: "advisor/projects/:projectId",
        element: <AdvisorProjectDetail />,
      },
      { path: "activity-logs", element: <ActivityLogs /> },

      {
        path: "coordinator/project-evaluations/:projectId",
        element: <CoordinatorProjectEvaluations />,
      },
      {
        path: "examiner/projects/:projectId",
        element: <ExaminerProjectDetail />,
      },
    ],
  },
]);

export default router;
