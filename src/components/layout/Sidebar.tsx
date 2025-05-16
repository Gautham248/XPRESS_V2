import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Briefcase, 
  Calendar, 
  BarChart, 
  Settings, 
  LogOut, 
  ChevronLeft,
  Plane,
  User
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  return (
    <aside 
      className={`bg-card flex flex-col border-r shadow-sm transition-all duration-300 
        ${isOpen ? 'w-64' : 'w-20'}`}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b">
        <div className={`flex items-center ${isOpen ? '' : 'justify-center w-full'}`}>
          <Plane className="h-6 w-6 text-primary" />
          <span className={`ml-2 text-xl font-semibold text-primary transition-opacity duration-200 
            ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
            TravelPro
          </span>
        </div>
        <button 
          onClick={toggleSidebar} 
          className="p-1 rounded-md hover:bg-muted transition-colors"
        >
          <ChevronLeft className={`h-5 w-5 text-muted-foreground transition-transform duration-300 
            ${isOpen ? '' : 'rotate-180'}`} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-2 space-y-1">
          <NavLink to="/" end className={({ isActive }) => 
            `sidebar-link ${isActive ? 'active' : ''}`}>
            <Home className="h-5 w-5" />
            <span className={`transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
              Dashboard
            </span>
          </NavLink>
          
          <NavLink to="/travel-requests" className={({ isActive }) => 
            `sidebar-link ${isActive ? 'active' : ''}`}>
            <Briefcase className="h-5 w-5" />
            <span className={`transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
              Travel Requests
            </span>
          </NavLink>
          
          <NavLink to="/calendar" className={({ isActive }) => 
            `sidebar-link ${isActive ? 'active' : ''}`}>
            <Calendar className="h-5 w-5" />
            <span className={`transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
              Calendar
            </span>
          </NavLink>
          
          <NavLink to="/reports" className={({ isActive }) => 
            `sidebar-link ${isActive ? 'active' : ''}`}>
            <BarChart className="h-5 w-5" />
            <span className={`transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
              Reports
            </span>
          </NavLink>
          
          <NavLink to="/settings" className={({ isActive }) => 
            `sidebar-link ${isActive ? 'active' : ''}`}>
            <Settings className="h-5 w-5" />
            <span className={`transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
              Settings
            </span>
          </NavLink>
        </nav>
      </div>
      
      <div className="p-4 border-t">
        <div className={`flex items-center ${isOpen ? '' : 'justify-center'}`}>
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
              <User className="h-4 w-4" />
            </div>
          </div>
          <div className={`ml-3 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
            <p className="text-sm font-medium">Sarah Parker</p>
            <p className="text-xs text-muted-foreground">Travel Manager</p>
          </div>
        </div>
        
        <button className={`mt-4 sidebar-link text-muted-foreground w-full ${isOpen ? '' : 'justify-center'}`}>
          <LogOut className="h-5 w-5" />
          <span className={`transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
            Log out
          </span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;