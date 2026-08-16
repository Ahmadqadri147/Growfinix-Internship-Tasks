import { Outlet } from "react-router-dom";

// Auth bypass: always render the child routes directly
export default function ProtectedRoute() {
  return <Outlet />;
}
