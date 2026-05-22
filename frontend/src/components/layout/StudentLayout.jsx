import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Footer from "../shared/Footer";

const StudentLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <main className="flex-shrink-0 p-6 bg-white">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default StudentLayout;
