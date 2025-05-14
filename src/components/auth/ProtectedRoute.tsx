import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const location = useLocation();
  
  // Check if user is authenticated
  const userString = localStorage.getItem('user');
  if (!userString) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const user = JSON.parse(userString);

  // Check if user has required role
  if (!allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on user's role
    const dashboardPath = `/${user.role}/dashboard`;
    return <Navigate to={dashboardPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;