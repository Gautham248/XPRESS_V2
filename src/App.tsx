import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/admin/Dashboard';
import TravelRequests from './components/table/TravelRequests';
import TravelRequestDetails from './components/request_details/TravelRequestDetails';
import Calendar from './pages/admin/Calendar';
import Reports from './pages/admin/Reports';
import Settings from './pages/admin/Settings';
import NotFound from './components/not_found/NotFound';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="travel-requests" element={<TravelRequests />} />
          <Route path="travel-requests/:id" element={<TravelRequestDetails />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;