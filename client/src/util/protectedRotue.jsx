// components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useUser } from "../hooks/userUser";
import { Spin } from "antd"; // or any loader you use

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { userdata, isLoading } = useUser();

  if (isLoading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "20vh" }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!userdata || !userdata.role) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userdata.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
