import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { 
  Home, 
  Briefcase, 
  Calendar, 
  BarChart, 
  Settings, 
  LogOut, 
  ChevronLeft,
  User,
  PlusCircle,
  FileText
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const navConfig: Record<string, NavItem[]> = {
  admin: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: <Home className="h-5 w-5" /> },
    { label: 'Travel Requests', path: '/admin/travel-requests', icon: <Briefcase className="h-5 w-5" /> },
    { label: 'Calendar', path: '/admin/calendar', icon: <Calendar className="h-5 w-5" /> },
    { label: 'Reports', path: '/admin/reports', icon: <BarChart className="h-5 w-5" /> },
    { label: 'Documents', path: '/admin/documents', icon: <FileText className="h-5 w-5" /> },
    // { label: 'New Request', path: '/admin/create-request', icon: <PlusCircle className="h-5 w-5" /> }
    // { label: 'Settings', path: '/admin/settings', icon: <Settings className="h-5 w-5" /> }
  ],
  manager: [
    { label: 'Dashboard', path: '/manager/dashboard', icon: <Home className="h-5 w-5" /> },
    { label: 'Team Requests', path: '/manager/team-requests', icon: <Briefcase className="h-5 w-5" /> },
    { label: 'My Requests', path: '/manager/my-requests', icon: <Briefcase className="h-5 w-5" /> },
    { label: 'Calendar', path: '/manager/calendar', icon: <Calendar className="h-5 w-5" /> }
  ],
  employee: [
    { label: 'Dashboard', path: '/employee/dashboard', icon: <Home className="h-5 w-5" /> },
    { label: 'New Request', path: '/employee/new-request', icon: <Briefcase className="h-5 w-5" /> },
    { label: 'My Requests', path: '/employee/my-requests', icon: <Briefcase className="h-5 w-5" /> },
    { label: 'Calendar', path: '/employee/calendar', icon: <Calendar className="h-5 w-5" /> }
  ]
};

interface RoleLayoutProps {
  role: 'admin' | 'manager' | 'employee';
}

const RoleLayout: React.FC<RoleLayoutProps> = ({ role }) => {
  const navigate = useNavigate();
  const navItems = navConfig[role];
  const [isOpen, setIsOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        pageTitle={`${role.charAt(0).toUpperCase() + role.slice(1)} Dashboard`}
        toggleSidebar={toggleSidebar} 
        sidebarOpen={isOpen}
      />
      <div className="flex-1 flex">
        <aside className={`bg-card flex flex-col border-r shadow-sm transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <div className={`flex items-center ${isOpen ? '' : 'justify-center w-full'}`}>
              <User className="h-6 w-6 text-primary" />
              <span className={`ml-2 text-xl font-semibold text-primary transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </span>
            </div>
            <button 
              onClick={toggleSidebar} 
              className="p-1 rounded-md hover:bg-muted transition-colors"
            >
              <ChevronLeft className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${isOpen ? '' : 'rotate-180'}`} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-2 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="sidebar-link flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-muted transition-colors"
                >
                  {item.icon}
                  <span className={`ml-3 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                    {item.label}
                  </span>
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="p-4 border-t">
            <button 
              onClick={handleLogout}
              className={`sidebar-link flex items-center w-full px-3 py-2 text-sm font-medium rounded-md hover:bg-muted transition-colors text-red-400 ${isOpen ? '' : 'justify-center'}`}
            >
              <LogOut className="h-5 w-5" />
              <span className={`ml-3 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                Logout
              </span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 bg-gray-100">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default RoleLayout;