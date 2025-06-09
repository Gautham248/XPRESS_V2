import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
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

interface User {
  role: string;
  token: string;
  userEmail: string;
  userId: number;
  userName: string;
}

const navConfig: Record<string, NavItem[]> = {
  admin: [
    { label: 'Dashboard', path: '/admin/reports', icon: <Home className="h-5 w-5" /> },
    { label: 'Travel Requests', path: '/admin/travel-requests', icon: <Briefcase className="h-5 w-5" /> },
    { label: 'Calendar', path: '/admin/calendar', icon: <Calendar className="h-5 w-5" /> },
  ],
  manager: [
    { label: 'Dashboard', path: '/manager/dashboard', icon: <Home className="h-5 w-5" /> },
    { label: 'New Request', path: '/manager/new-request', icon: <PlusCircle className="h-5 w-5" /> },
    { label: 'Team Requests', path: '/manager/team-requests', icon: <Briefcase className="h-5 w-5" /> },
    { label: 'Documents', path: '/manager/documents', icon: <FileText className="h-5 w-5" /> },
  ],
  employee: [
    { label: 'Dashboard', path: '/employee/dashboard', icon: <Home className="h-5 w-5" /> },
    { label: 'New Request', path: '/employee/new-request', icon: <PlusCircle className="h-5 w-5" /> },
    { label: 'My Requests', path: '/employee/my-requests', icon: <Briefcase className="h-5 w-5" /> },
    { label: 'Documents', path: '/employee/documents', icon: <FileText className="h-5 w-5" /> },
  ]
};

interface RoleLayoutProps {
  role: 'admin' | 'manager' | 'employee';
}

const RoleLayout: React.FC<RoleLayoutProps> = ({ role }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = navConfig[role];
  const [isOpen, setIsOpen] = useState(true);
  const [userName, setUserName] = useState<string>(''); // State to store the employee's name

  // Fetch user data from local storage when the component mounts
  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user: User = JSON.parse(userString);
      setUserName(user.userName || 'User'); // Fallback to 'User' if userName is not available
    } else {
      setUserName('User'); // Fallback if no user data is found
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="flex flex-col overflow-hidden" style={{ zoom: '0.8', height: '125vh' }}>
      {/* Fixed Header */}
      <Header 
        pageTitle={role === 'admin' ? 'Travel Administrator' : 'Traveler'}
        toggleSidebar={toggleSidebar} 
        sidebarOpen={isOpen}
      />
      
      {/* Main container with sidebar and content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Fixed Sidebar */}
        <aside className={`bg-card flex flex-col border-r shadow-sm transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'} flex-shrink-0`}>
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <div className={`flex items-center ${isOpen ? '' : 'justify-center w-full'}`}>
              <User className="h-6 w-6 text-primary" />
              <span className={`ml-2 text-xl font-semibold text-primary transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                {userName}
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
                  className={`sidebar-link flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive(item.path) 
                      ? 'bg-muted text-foreground' 
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className={isActive(item.path) ? 'text-foreground' : ''}>
                    {item.icon}
                  </span>
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

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-100">
          <div className="p-8">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Fixed Footer */}
      <Footer />
    </div>
  );
};

export default RoleLayout;