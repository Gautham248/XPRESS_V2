import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  
  // Extract page title from location
const getPageTitle = () => {
  const path = location.pathname;

  // Check if the base path starts with '/admin'
  const isAdmin = path.startsWith('/admin');

  // Split the path into segments and remove empty segments
  const pathSegments = path.split('/').filter(segment => segment);

  // If the path is just '/', return the appropriate dashboard title
  if (path === '/') {
    return isAdmin ? 'Admin Dashboard' : 'Traveler Dashboard';
  }

  // Capitalize and format the last segment for the page title
  const lastSegment = pathSegments[pathSegments.length - 1];
  const formattedTitle = lastSegment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Prepend "Admin Dashboard" or "Traveler Dashboard" based on the base path
  return isAdmin ? `Admin Dashboard - ${formattedTitle}` : `Traveler Dashboard - ${formattedTitle}`;
};
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-muted/30">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header 
          pageTitle={getPageTitle()} 
          toggleSidebar={toggleSidebar}
          sidebarOpen={sidebarOpen}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 transition-all">
          <Outlet />
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default Layout;