import { Navigate } from "react-router-dom";
import { useMemo } from "react";

const ProtectedRoute = ({ children, role }) => {
  // Use useMemo to ensure the user object reference stays stable
  // between renders unless the actual session data changes.
  const user = useMemo(() => {
    try {
      const userData = sessionStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Failed to parse user from session:", error);
      return null;
    }
  }, []);

  // 1. Not logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // 2. Role mismatch
  // If a role is required and the user doesn't have it, redirect.
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  // 3. Authorized
  return children;
};

export default ProtectedRoute;
