import { Navigate } from "react-router-dom";
import { getSession } from "../api";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { accessToken, role } = getSession();

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  if (
    allowedRoles.length > 0 &&
    !allowedRoles.some(
      (allowedRole) => allowedRole.toLowerCase() === role?.toLowerCase(),
    )
  ) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
