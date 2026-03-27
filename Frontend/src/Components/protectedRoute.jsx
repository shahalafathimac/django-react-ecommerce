import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";

import { UserContext } from "../UserContext";

export const ProtectedRoute = ({ requiredRole }) => {
  const { user, loading } = useContext(UserContext);

  if (loading) {
    return <div className="pt-28 text-center text-gray-600">Loading session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export const UserRoute = () => {
  const { user, loading } = useContext(UserContext);

  if (loading) {
    return <div className="pt-28 text-center text-gray-600">Loading session...</div>;
  }

  if (user?.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
