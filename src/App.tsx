import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleLayout from './components/layout/RoleLayout';
import AdminDashboard from './pages/admin/Dashboard';
import ManagerDashboard from './pages/manager/Dashboard';
import EmployeeDashboard from './pages/employee/Dashboard';
import TravelRequests from './components/table/TravelRequests';
import TravelRequestDetails from './components/request_details/TravelRequestDetails';
import Calendar from './pages/admin/Calendar';
import Reports from './pages/admin/Reports';
import Settings from './pages/admin/Settings';
import NotFound from './components/not_found/NotFound';
import Documents from './components/document/Documents';
import CreateRequest from './pages/employee/CreateRequest';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <RoleLayout role="admin" />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="travel-requests" element={<TravelRequests />} />
          <Route path="travel-requests/:id" element={<TravelRequestDetails />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="documents" element={<Documents />} />
        </Route>

        {/* Manager Routes */}
        <Route path="/manager" element={
          <ProtectedRoute allowedRoles={['manager']}>
            <RoleLayout role="manager" />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ManagerDashboard />} />
          <Route path="team-requests" element={<TravelRequests />} />
          <Route path="team-requests/:id" element={<TravelRequestDetails />} />
          <Route path="my-requests" element={<TravelRequests />} />
          <Route path="my-requests/:id" element={<TravelRequestDetails />} />
          <Route path="calendar" element={<Calendar />} />
        </Route>

        {/* Employee Routes */}
        <Route path="/employee" element={
          <ProtectedRoute allowedRoles={['employee']}>
            <RoleLayout role="employee" />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<EmployeeDashboard />} />
          <Route path="new-request" element={<TravelRequests />} />
          <Route path="my-requests" element={<TravelRequests />} />
          <Route path="my-requests/:id" element={<TravelRequestDetails />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="create-request" element={<CreateRequest />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;