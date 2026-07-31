import { Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  requireAdmin?: boolean;
}

// Auth bypass: always render the child routes directly
export default function ProtectedRoute(_props: ProtectedRouteProps) {
  return <Outlet />;
}
