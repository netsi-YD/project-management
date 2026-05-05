import { createBrowserRouter } from "react-router-dom";
import Dashboard from "./views/advisor/AdvisorDashboard";

// If you have a Login component, import it
// import Login from "./components/login";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Dashboard />,
  },
  {
    path: "/advisor/dashboard",
    element: <Dashboard />,
  },
  // Add login route if you have it
  // {
  //   path: "/login",
  //   element: <Login />,
  // },
]);

export default router;