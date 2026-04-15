import { createBrowserRouter } from "react-router-dom";

import PublicGuestHome from "./pages/guest/PublicGuestHome";
import GuestProjects from "./pages/guest/GuestProjects";
import AccessRequestForm from "./pages/guest/AccessRequestForm";
import Login from "./components/Login";

const router = createBrowserRouter([
  { path: "/", element: <PublicGuestHome /> },
  { path: "/login", element: <Login /> },

  { path: "/guest/projects", element: <GuestProjects /> },
  { path: "/guest/access-request", element: <AccessRequestForm /> },
]);

export default router;
