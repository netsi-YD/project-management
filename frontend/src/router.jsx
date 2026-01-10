// src/router.jsx
import { createBrowserRouter } from "react-router-dom";
import Login from "./components/Login.jsx";
import DashBoard from "./views/DashBoard.jsx";

const router = createBrowserRouter([
  { path: "/", element: <Login /> }, // default route
  { path: "/login", element: <Login /> },
  { path: "/dashboard", element: <DashBoard /> },
]);

export default router;
