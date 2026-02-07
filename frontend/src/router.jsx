import { createBrowserRouter } from "react-router-dom";
import Login from "./components/login.jsx";
import AdvisorDashboard from "./views/advisor/AdvisorDashboard.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/advisor/dashboard",
    element: <AdvisorDashboard />,
  },
]);

export default router;