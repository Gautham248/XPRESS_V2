import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const location = useLocation();
  

  const userString = localStorage.getItem('user');
  if (!userString) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const user = JSON.parse(userString);

  if (!allowedRoles.includes(user.role)) {
    const dashboardPath = `/${user.role}/dashboard`;
    return <Navigate to={dashboardPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;