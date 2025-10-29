import { createBrowserRouter } from "react-router-dom";
import Login from "./views/Login.jsx";
import Register from "./views/Register.jsx";
import Register from "./views/Register.jsx";
import NotFound from "./views/NotFound.jsx";
const router = createBrowserRouter(routes, [
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
    element: <Users />,
  },
]);
export default router;
