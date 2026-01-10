import React from "react";
import { RouterProvider } from "react-router-dom";
import router from "./router"; // make sure this points to your router.jsx
import "./App.css";

function App() {
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
