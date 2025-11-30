// src/components/layout/user/UserLayout.jsx
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import ScrollToTop from "../../ui/ScrollToTop.jsx";

const UserLayout = () => {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
        <Outlet />
      </main>
      <Footer />
      <ScrollToTop />
    </>
  );
};

export default UserLayout;
