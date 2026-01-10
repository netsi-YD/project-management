import { createBrowserRouter } from "react-router-dom";
import Login from "./views/Login.jsx";
import Register from "./views/Register.jsx";
import NotFound from "./views/NotFound.jsx";
import Users from "./views/Users.jsx";
import DashBoard from "./views/dashboard.jsx";
const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/users",
    element: <Users />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
  {
    path: "/dashboard",
    element: <DashBoard />,
  },
]);

export default router;
