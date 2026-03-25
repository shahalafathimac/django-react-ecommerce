import React, { useState } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import {
  FiBarChart2,
  FiPackage,
  FiShoppingBag,
  FiUsers,
  FiMenu,
} from "react-icons/fi";

/* MAIN ADMIN LAYOUT (Navbar + Sidebar + Outlet Content) */
const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div>
      <Sidebar setSidebarOpen={setSidebarOpen} />
      <Navbar isOpen={sidebarOpen} />
      <div
        className={`transition-all duration-300 pt-24 px-6 ${
          sidebarOpen ? "pl-64" : "pl-20"
        }`}
      >
        <Outlet />
      </div>
    </div>
  );
};

/* SIDEBAR */
const Sidebar = ({ setSidebarOpen }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    setSidebarOpen(newState);
  };

  const menuItems = [
    { path: "/admin/dashboard", icon: <FiBarChart2 size={20} />, label: "Dashboard" },
    { path: "/admin/orders",    icon: <FiPackage size={20} />,   label: "Orders"    },
    { path: "/admin/products",  icon: <FiShoppingBag size={20} />, label: "Products"},
    { path: "/admin/users",     icon: <FiUsers size={20} />,     label: "Users"     },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div
      className={`bg-gray-800 text-white h-screen fixed top-0 left-0 transition-all duration-300 z-50 ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      <div className="p-4 flex items-center justify-between">
        {isOpen && (
          <h1 className="text-lg font-bold whitespace-nowrap">
            Orovia Ornaments
          </h1>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-gray-700 transition"
        >
          <FiMenu className="h-6 w-6 text-white" />
        </button>
      </div>

      {isOpen && (
        <nav className="mt-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 hover:bg-gray-700 ${
                isActive(item.path) ? "bg-blue-600" : "text-gray-300"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="ml-3">{item.label}</span>
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
};

/* NAVBAR */
const Navbar = ({ isOpen }) => {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/login", { replace: true });
  };

  return (
    <nav
      className={`bg-gray-800 text-white h-16 flex items-center px-6 border-b border-gray-700
        fixed top-0 left-0 right-0 z-40 transition-all duration-300
        ${isOpen ? "pl-64" : "pl-20"}`}
    >
      <h1 className="text-xl font-semibold">Admin Panel</h1>

      <div className="ml-auto relative">
        <button onClick={() => setIsProfileOpen(!isProfileOpen)}>
          <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white">A</span>
          </div>
        </button>

        {isProfileOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white text-gray-900 rounded shadow-lg border">
            {/* ✅ was: onClick={() => navigate("/login")} — didn't clear localStorage */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-red-600 w-full text-left hover:bg-gray-200"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AdminLayout;