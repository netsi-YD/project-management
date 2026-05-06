import { Outlet } from "react-router-dom";
import StaffSidebar from "./StaffSidebar";
import Header from "../shared/Header";
import Footer from "../shared/Footer";

const StaffLayout = () => {
  const roles = JSON.parse(localStorage.getItem("roles") || "[]");
  const user = { roles };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <StaffSidebar user={user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8 bg-white">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default StaffLayout;
