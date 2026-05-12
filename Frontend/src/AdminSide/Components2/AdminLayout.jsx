import React, { useContext, useState } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import {
  FiBarChart2, FiPackage, FiShoppingBag, FiUsers, FiMenu, FiX,
} from "react-icons/fi";
import { UserContext } from "../../UserContext";

const menuItems = [
  { path: "/admin/dashboard", icon: <FiBarChart2 size={20} />, label: "Dashboard" },
  { path: "/admin/orders", icon: <FiPackage size={20} />, label: "Orders" },
  { path: "/admin/products", icon: <FiShoppingBag size={20} />, label: "Products" },
  { path: "/admin/users", icon: <FiUsers size={20} />, label: "Users" },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <div className={`hidden md:flex flex-col bg-gray-800 text-white h-screen fixed top-0 left-0 transition-all duration-300 z-50 ${sidebarOpen ? "w-64" : "w-20"}`}>
        <div className="p-4 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-lg font-bold whitespace-nowrap">Orovia Ornaments</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-md hover:bg-gray-700">
            <FiMenu className="h-6 w-6 text-white" />
          </button>
        </div>
        <nav className="mt-4">
          {menuItems.map((item) => (
            <DesktopLink key={item.path} item={item} isOpen={sidebarOpen} />
          ))}
        </nav>
      </div>

      {/* Mobile Sidebar */}
      <div className={`md:hidden fixed top-0 left-0 h-screen w-64 bg-gray-800 text-white z-50 transform transition-transform duration-300 ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-4 flex items-center justify-between">
          <h1 className="text-lg font-bold">Orovia Ornaments</h1>
          <button onClick={() => setMobileSidebarOpen(false)} className="p-2 rounded-md hover:bg-gray-700">
            <FiX className="h-6 w-6 text-white" />
          </button>
        </div>
        <nav className="mt-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileSidebarOpen(false)}
              className="flex items-center px-4 py-3 hover:bg-gray-700 text-gray-300"
            >
              <span>{item.icon}</span>
              <span className="ml-3">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Top Navbar */}
      <nav className={`bg-gray-800 text-white h-16 flex items-center px-4 border-b border-gray-700 fixed top-0 right-0 z-40 transition-all duration-300 ${sidebarOpen ? "md:left-64" : "md:left-20"} left-0`}>
        {/* Mobile hamburger */}
        <button className="md:hidden p-2 rounded-md hover:bg-gray-700 mr-3" onClick={() => setMobileSidebarOpen(true)}>
          <FiMenu className="h-6 w-6 text-white" />
        </button>
        <h1 className="text-xl font-semibold">Admin Panel</h1>
        <div className="ml-auto">
          <ProfileMenu />
        </div>
      </nav>

      {/* Main Content */}
      <div className={`transition-all duration-300 pt-20 px-4 md:px-6 ${sidebarOpen ? "md:pl-64" : "md:pl-20"}`}>
        <Outlet />
      </div>
    </div>
  );
};

const DesktopLink = ({ item, isOpen }) => {
  const location = useLocation();
  const isActive = location.pathname === item.path;
  return (
    <Link
      to={item.path}
      className={`flex items-center px-4 py-3 hover:bg-gray-700 ${isActive ? "bg-blue-600" : "text-gray-300"}`}
    >
      <span className="flex-shrink-0">{item.icon}</span>
      {isOpen && <span className="ml-3 whitespace-nowrap">{item.label}</span>}
    </Link>
  );
};

const ProfileMenu = () => {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { logout, user } = useContext(UserContext);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="relative">
      <button onClick={() => setIsProfileOpen(!isProfileOpen)}>
        <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white">{user?.name?.charAt(0)?.toUpperCase() || "A"}</span>
        </div>
      </button>
      {isProfileOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white text-gray-900 rounded shadow-lg border z-50">
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-red-600 w-full text-left hover:bg-gray-200"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;