import React, { useState } from 'react';
import { 
  Bell, 
  Search, 
  Menu, 
  X,
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  pageTitle: string;
  toggleSidebar: () => void;
  sidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ pageTitle, toggleSidebar, sidebarOpen }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  return (
    <header className="bg-card border-b h-16 flex items-center z-30 sticky top-0">
      <div className="flex items-center justify-between w-full px-4">
        <div className="flex items-center">
          {!sidebarOpen && (
            <button 
              onClick={toggleSidebar}
              className="mr-4 p-1.5 rounded-md text-muted-foreground hover:bg-muted transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          <h1 className="text-xl font-semibold">{pageTitle}</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* <div className={`relative ${searchOpen ? 'w-64' : 'w-10'} transition-all duration-300`}>
            <div className={`absolute inset-y-0 left-0 flex items-center pl-3 ${searchOpen ? 'pointer-events-none' : ''}`}>
              <button 
                onClick={() => setSearchOpen(true)}
                className={`text-muted-foreground hover:text-foreground transition-colors ${searchOpen ? 'opacity-100' : ''}`}
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Search..."
              className={`pl-10 pr-4 py-2 rounded-md bg-muted w-full focus:outline-none focus:ring-1 focus:ring-primary transition-all ${searchOpen ? 'opacity-100' : 'opacity-0'}`}
              onBlur={() => setSearchOpen(false)}
              style={{ display: searchOpen ? 'block' : 'none' }}
            />
            {searchOpen && (
              <button 
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setSearchOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div> */}
          
          <div className="relative">
            <button 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-1.5 rounded-md text-muted-foreground hover:bg-muted transition-colors"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-error"></span>
            </button>
            
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-card border rounded-md shadow-elevation-3 z-50">
                <div className="flex items-center justify-between px-4 py-2 border-b">
                  <h3 className="font-medium">Notifications</h3>
                  <button className="text-sm text-primary hover:text-primary-light">
                    Mark all as read
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <div className="p-4 border-b hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start">
                      <p className="font-medium text-sm">New travel request</p>
                      <span className="text-xs text-muted-foreground">2m ago</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      John Doe submitted a new travel request for approval
                    </p>
                  </div>
                  <div className="p-4 border-b hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start">
                      <p className="font-medium text-sm">Request approved</p>
                      <span className="text-xs text-muted-foreground">1h ago</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your travel request to San Francisco was approved
                    </p>
                  </div>
                  <div className="p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start">
                      <p className="font-medium text-sm">Flight reminder</p>
                      <span className="text-xs text-muted-foreground">1d ago</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your flight to New York departs tomorrow at 10:30 AM
                    </p>
                  </div>
                </div>
                <div className="p-2 border-t">
                  <button className="w-full text-center text-sm text-primary hover:text-primary-light py-1">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="hidden md:flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
              <span className="text-sm font-medium">SP</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm">Sarah Parker</span>
              <ChevronDown className="h-4 w-4 ml-1 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;