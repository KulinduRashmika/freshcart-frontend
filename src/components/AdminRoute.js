import { Navigate } from "react-router-dom";

function AdminRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || user.email !== "admin@gmail.com") {
    return <Navigate to="/home" replace />;
  }

  return children;
}

export default AdminRoute;