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
  const role = user.role;

  // Check if user has required role
  if (!allowedRoles.includes(role)) {
    // Redirect based on role like login page
    if (role === 'Admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/manager/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
