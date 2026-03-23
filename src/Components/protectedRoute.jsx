import React from "react";
import { Navigate, Outlet } from "react-router-dom";

// ✅ Protects ADMIN routes — redirects non-admins to /login
export const ProtectedRoute = ({ requiredRole }) => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  if (!user || !user.role) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

// ✅ Protects USER routes — redirects admins to /admin/dashboard
export const UserRoute = () => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  if (user?.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;