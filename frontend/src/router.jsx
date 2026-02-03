// src/router.jsx
import { createBrowserRouter } from "react-router-dom";
import Login from "./components/Login.jsx";
import GuestDashboard from "./pages/guest/GuestDashboard.jsx";

const router = createBrowserRouter([
  { path: "/", element: <Login /> }, // default route
  { path: "/login", element: <Login /> },
  {
    path: "/guest/dashboard",
    element: <GuestDashboard />,
  },
]);

export default router;
