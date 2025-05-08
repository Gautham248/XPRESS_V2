import React, { useState } from 'react';
import { 
  Save, 
  User, 
  Bell, 
  Shield, 
  Briefcase,
  Globe,
  Building,
  CreditCard,
  CheckCircle
} from 'lucide-react';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'preferences':
        return <PreferenceSettings />;
      case 'company':
        return <CompanySettings />;
      case 'payment':
        return <PaymentSettings />;
      default:
        return <ProfileSettings />;
    }
  };
  
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-semibold">Settings</h2>
      </div>
      
      <div className="card p-0">
        <div className="flex flex-col sm:flex-row">
          <nav className="w-full sm:w-64 border-r">
            <div className="p-4 border-b">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white">
                  <span className="text-sm font-medium">SP</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">Sarah Parker</p>
                  <p className="text-xs text-muted-foreground">Travel Manager</p>
                </div>
              </div>
            </div>
            
            <div className="p-2">
              <button 
                className={`w-full text-left flex items-center px-3 py-2 rounded-md text-sm ${
                  activeTab === 'profile' 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => setActiveTab('profile')}
              >
                <User className="h-4 w-4 mr-3" />
                Profile
              </button>
              
              <button 
                className={`w-full text-left flex items-center px-3 py-2 rounded-md text-sm ${
                  activeTab === 'notifications' 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => setActiveTab('notifications')}
              >
                <Bell className="h-4 w-4 mr-3" />
                Notifications
              </button>
              
              <button 
                className={`w-full text-left flex items-center px-3 py-2 rounded-md text-sm ${
                  activeTab === 'security' 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => setActiveTab('security')}
              >
                <Shield className="h-4 w-4 mr-3" />
                Security
              </button>
              
              <button 
                className={`w-full text-left flex items-center px-3 py-2 rounded-md text-sm ${
                  activeTab === 'preferences' 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => setActiveTab('preferences')}
              >
                <Briefcase className="h-4 w-4 mr-3" />
                Travel Preferences
              </button>
              
              <button 
                className={`w-full text-left flex items-center px-3 py-2 rounded-md text-sm ${
                  activeTab === 'company' 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => setActiveTab('company')}
              >
                <Building className="h-4 w-4 mr-3" />
                Company
              </button>
              
              <button 
                className={`w-full text-left flex items-center px-3 py-2 rounded-md text-sm ${
                  activeTab === 'payment' 
                    ? 'bg-primary/10 text-primary' 
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => setActiveTab('payment')}
              >
                <CreditCard className="h-4 w-4 mr-3" />
                Payment Methods
              </button>
            </div>
          </nav>
          
          <div className="flex-1 p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Profile Settings</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Update your personal information and profile settings.
        </p>
      </div>
      
      <div className="flex items-center space-x-4 pb-6 border-b">
        <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center text-white">
          <span className="text-xl font-medium">SP</span>
        </div>
        <div>
          <p className="font-medium mb-1">Profile Picture</p>
          <div className="flex space-x-2">
            <button className="text-sm px-3 py-1 bg-muted rounded-md hover:bg-muted/70">
              Change
            </button>
            <button className="text-sm px-3 py-1 text-muted-foreground hover:text-foreground">
              Remove
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium">
            First Name
            <input 
              type="text" 
              className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
              defaultValue="Sarah"
            />
          </label>
        </div>
        
        <div>
          <label className="text-sm font-medium">
            Last Name
            <input 
              type="text" 
              className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
              defaultValue="Parker"
            />
          </label>
        </div>
        
        <div>
          <label className="text-sm font-medium">
            Email Address
            <input 
              type="email" 
              className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
              defaultValue="sarah.parker@company.com"
            />
          </label>
        </div>
        
        <div>
          <label className="text-sm font-medium">
            Phone Number
            <input 
              type="tel" 
              className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
              defaultValue="+1 (555) 123-4567"
            />
          </label>
        </div>
        
        <div className="md:col-span-2">
          <label className="text-sm font-medium">
            Job Title
            <input 
              type="text" 
              className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
              defaultValue="Travel Manager"
            />
          </label>
        </div>
        
        <div className="md:col-span-2">
          <label className="text-sm font-medium">
            Department
            <select 
              className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
              defaultValue="HR-01"
            >
              <option value="HR-01">Human Resources</option>
              <option value="MKT-01">Marketing</option>
              <option value="SLS-01">Sales</option>
              <option value="IT-01">Information Technology</option>
              <option value="FIN-01">Finance</option>
            </select>
          </label>
        </div>
      </div>
      
      <div className="flex justify-end pt-4">
        <button className="btn-primary flex items-center">
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </button>
      </div>
    </div>
  );
};

const NotificationSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Notification Settings</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Control how you receive notifications and alerts.
        </p>
      </div>
      
      <div className="space-y-6">
        <div className="pb-4 border-b">
          <h4 className="font-medium mb-4">Email Notifications</h4>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">New travel request</p>
                <p className="text-sm text-muted-foreground">
                  Receive an email when a new travel request is submitted
                </p>
              </div>
              <div className="h-6 w-11 rounded-full bg-primary relative">
                <div className="h-5 w-5 rounded-full bg-white absolute right-0.5 top-0.5"></div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Request updates</p>
                <p className="text-sm text-muted-foreground">
                  Receive an email when a travel request is updated
                </p>
              </div>
              <div className="h-6 w-11 rounded-full bg-primary relative">
                <div className="h-5 w-5 rounded-full bg-white absolute right-0.5 top-0.5"></div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Approval notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive an email when your request is approved or rejected
                </p>
              </div>
              <div className="h-6 w-11 rounded-full bg-primary relative">
                <div className="h-5 w-5 rounded-full bg-white absolute right-0.5 top-0.5"></div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Travel reminders</p>
                <p className="text-sm text-muted-foreground">
                  Receive an email reminder before your scheduled trips
                </p>
              </div>
              <div className="h-6 w-11 rounded-full bg-primary relative">
                <div className="h-5 w-5 rounded-full bg-white absolute right-0.5 top-0.5"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pb-4 border-b">
          <h4 className="font-medium mb-4">In-App Notifications</h4>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">All notifications</p>
                <p className="text-sm text-muted-foreground">
                  Enable or disable all in-app notifications
                </p>
              </div>
              <div className="h-6 w-11 rounded-full bg-primary relative">
                <div className="h-5 w-5 rounded-full bg-white absolute right-0.5 top-0.5"></div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Request updates</p>
                <p className="text-sm text-muted-foreground">
                  Show notifications for travel request updates
                </p>
              </div>
              <div className="h-6 w-11 rounded-full bg-primary relative">
                <div className="h-5 w-5 rounded-full bg-white absolute right-0.5 top-0.5"></div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">System notifications</p>
                <p className="text-sm text-muted-foreground">
                  Show notifications for system updates and maintenance
                </p>
              </div>
              <div className="h-6 w-11 rounded-full bg-muted relative">
                <div className="h-5 w-5 rounded-full bg-white absolute left-0.5 top-0.5"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium mb-4">Notification Preferences</h4>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                Email Frequency
                <select 
                  className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                  defaultValue="immediate"
                >
                  <option value="immediate">Immediate</option>
                  <option value="daily">Daily Digest</option>
                  <option value="weekly">Weekly Summary</option>
                </select>
              </label>
            </div>
            
            <div>
              <label className="text-sm font-medium">
                Notification Sound
                <select 
                  className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                  defaultValue="chime"
                >
                  <option value="none">None</option>
                  <option value="chime">Chime</option>
                  <option value="bell">Bell</option>
                  <option value="ping">Ping</option>
                </select>
              </label>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end pt-4">
        <button className="btn-primary flex items-center">
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </button>
      </div>
    </div>
  );
};

const SecuritySettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Manage your password and account security settings.
        </p>
      </div>
      
      <div className="space-y-6">
        <div className="pb-4 border-b">
          <h4 className="font-medium mb-4">Change Password</h4>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                Current Password
                <input 
                  type="password" 
                  className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="••••••••"
                />
              </label>
            </div>
            
            <div>
              <label className="text-sm font-medium">
                New Password
                <input 
                  type="password" 
                  className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="••••••••"
                />
              </label>
              <p className="text-xs text-muted-foreground mt-1">
                Password must be at least 8 characters and include a number and special character.
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium">
                Confirm New Password
                <input 
                  type="password" 
                  className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="••••••••"
                />
              </label>
            </div>
            
            <button className="btn-primary mt-2">
              Update Password
            </button>
          </div>
        </div>
        
        <div className="pb-4 border-b">
          <h4 className="font-medium mb-4">Two-Factor Authentication</h4>
          
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Enable Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <div className="h-6 w-11 rounded-full bg-muted relative">
              <div className="h-5 w-5 rounded-full bg-white absolute left-0.5 top-0.5"></div>
            </div>
          </div>
        </div>
        
        <div className="pb-4 border-b">
          <h4 className="font-medium mb-4">Login Sessions</h4>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 border rounded-md">
              <div>
                <p className="font-medium flex items-center">
                  <CheckCircle className="h-4 w-4 text-success mr-2" />
                  Current Session
                </p>
                <p className="text-sm text-muted-foreground">
                  Chrome on Windows • IP: 192.168.1.1
                </p>
                <p className="text-xs text-muted-foreground">
                  Last active: Just now
                </p>
              </div>
              <button className="text-sm text-primary hover:text-primary-light font-medium">
                Logout
              </button>
            </div>
            
            <div className="flex justify-between items-center p-3 border rounded-md">
              <div>
                <p className="font-medium">Mobile App</p>
                <p className="text-sm text-muted-foreground">
                  iPhone 13 • iOS 16.5
                </p>
                <p className="text-xs text-muted-foreground">
                  Last active: 2 hours ago
                </p>
              </div>
              <button className="text-sm text-primary hover:text-primary-light font-medium">
                Logout
              </button>
            </div>
            
            <button className="text-sm text-error hover:text-error/80 font-medium">
              Logout from all devices
            </button>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium mb-4">Account Activity</h4>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm">Last password change</p>
              <p className="text-sm font-medium">30 days ago</p>
            </div>
            
            <div className="flex justify-between items-center">
              <p className="text-sm">Account created</p>
              <p className="text-sm font-medium">January 15, 2023</p>
            </div>
            
            <div className="flex justify-between items-center">
              <p className="text-sm">Login notifications</p>
              <div className="h-6 w-11 rounded-full bg-primary relative">
                <div className="h-5 w-5 rounded-full bg-white absolute right-0.5 top-0.5"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end pt-4">
        <button className="btn-primary flex items-center">
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </button>
      </div>
    </div>
  );
};

const PreferenceSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Travel Preferences</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Set your default travel preferences to streamline the request process.
        </p>
      </div>
      
      <div className="pb-4 border-b">
        <h4 className="font-medium mb-4">Transportation Preferences</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium">
              Preferred Airline
              <select 
                className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                defaultValue="any"
              >
                <option value="any">No Preference</option>
                <option value="delta">Delta Air Lines</option>
                <option value="united">United Airlines</option>
                <option value="american">American Airlines</option>
                <option value="southwest">Southwest Airlines</option>
              </select>
            </label>
          </div>
          
          <div>
            <label className="text-sm font-medium">
              Seat Preference
              <select 
                className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                defaultValue="aisle"
              >
                <option value="any">No Preference</option>
                <option value="window">Window</option>
                <option value="aisle">Aisle</option>
                <option value="middle">Middle</option>
              </select>
            </label>
          </div>
          
          <div>
            <label className="text-sm font-medium">
              Flight Class
              <select 
                className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                defaultValue="economy"
              >
                <option value="economy">Economy</option>
                <option value="premium_economy">Premium Economy</option>
                <option value="business">Business</option>
                <option value="first">First Class</option>
              </select>
            </label>
          </div>
          
          <div>
            <label className="text-sm font-medium">
              Car Rental Preference
              <select 
                className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                defaultValue="midsize"
              >
                <option value="economy">Economy</option>
                <option value="compact">Compact</option>
                <option value="midsize">Midsize</option>
                <option value="fullsize">Full Size</option>
                <option value="suv">SUV</option>
              </select>
            </label>
          </div>
        </div>
      </div>
      
      <div className="pb-4 border-b">
        <h4 className="font-medium mb-4">Accommodation Preferences</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium">
              Preferred Hotel Chain
              <select 
                className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                defaultValue="any"
              >
                <option value="any">No Preference</option>
                <option value="marriott">Marriott</option>
                <option value="hilton">Hilton</option>
                <option value="hyatt">Hyatt</option>
                <option value="ihg">IHG</option>
              </select>
            </label>
          </div>
          
          <div>
            <label className="text-sm font-medium">
              Room Type
              <select 
                className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                defaultValue="standard"
              >
                <option value="standard">Standard</option>
                <option value="deluxe">Deluxe</option>
                <option value="suite">Suite</option>
              </select>
            </label>
          </div>
          
          <div className="flex items-center space-x-2 md:col-span-2">
            <input 
              type="checkbox" 
              id="nonSmoking"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              defaultChecked
            />
            <label htmlFor="nonSmoking" className="text-sm font-medium">
              Non-smoking room
            </label>
          </div>
        </div>
      </div>
      
      <div className="pb-4 border-b">
        <h4 className="font-medium mb-4">Dietary Restrictions</h4>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              id="vegetarian"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="vegetarian" className="text-sm">
              Vegetarian
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              id="vegan"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="vegan" className="text-sm">
              Vegan
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              id="glutenFree"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="glutenFree" className="text-sm">
              Gluten-free
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              id="lactoseFree"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="lactoseFree" className="text-sm">
              Lactose-free
            </label>
          </div>
          
          <div className="mt-4">
            <label className="text-sm font-medium">
              Other Dietary Restrictions
              <textarea 
                className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                rows={3}
                placeholder="Enter any other dietary restrictions or allergies"
              ></textarea>
            </label>
          </div>
        </div>
      </div>
      
      <div>
        <h4 className="font-medium mb-4">Special Assistance</h4>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              id="wheelchair"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="wheelchair" className="text-sm">
              Wheelchair assistance
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              id="mobility"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="mobility" className="text-sm">
              Limited mobility
            </label>
          </div>
          
          <div className="mt-4">
            <label className="text-sm font-medium">
              Additional Assistance Requirements
              <textarea 
                className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                rows={3}
                placeholder="Enter any other assistance requirements"
              ></textarea>
            </label>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end pt-4">
        <button className="btn-primary flex items-center">
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </button>
      </div>
    </div>
  );
};

const CompanySettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Company Settings</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Configure company-wide travel policies and settings.
        </p>
      </div>
      
      <div className="pb-4 border-b">
        <h4 className="font-medium mb-4">Company Information</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="text-sm font-medium">
              Company Name
              <input 
                type="text" 
                className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                defaultValue="Acme Corporation"
              />
            </label>
          </div>
          
          <div>
            <label className="text-sm font-medium">
              Industry
              <select 
                className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                defaultValue="technology"
              >
                <option value="technology">Technology</option>
                <option value="finance">Finance</option>
                <option value="healthcare">Healthcare</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="education">Education</option>
                <option value="retail">Retail</option>
                <option value="other">Other</option>
              </select>
            </label>
          </div>
          
          <div>
            <label className="text-sm font-medium">
              Company Size
              <select 
                className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                defaultValue="medium"
              >
                <option value="small">1-50 employees</option>
                <option value="medium">51-200 employees</option>
                <option value="large">201-1000 employees</option>
                <option value="enterprise">1000+ employees</option>
              </select>
            </label>
          </div>
          
          <div className="md:col-span-2">
            <label className="text-sm font-medium">
              Company Address
              <textarea 
                className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                rows={3}
                defaultValue="123 Business Street, Suite 100, San Francisco, CA 94107"
              ></textarea>
            </label>
          </div>
        </div>
      </div>
      
      <div className="pb-4 border-b">
        <h4 className="font-medium mb-4">Travel Policy</h4>
        
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium">
              Maximum Domestic Travel Budget (per day)
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-muted-foreground">$</span>
                </div>
                <input 
                  type="number" 
                  className="pl-6 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                  defaultValue="300"
                />
              </div>
            </label>
          </div>
          
          <div>
            <label className="text-sm font-medium">
              Maximum International Travel Budget (per day)
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-muted-foreground">$</span>
                </div>
                <input 
                  type="number" 
                  className="pl-6 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                  defaultValue="500"
                />
              </div>
            </label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium">
                Advance Booking Requirement (days)
                <input 
                  type="number" 
                  className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                  defaultValue="14"
                />
              </label>
            </div>
            
            <div>
              <label className="text-sm font-medium">
                Maximum Trip Duration (days)
                <input 
                  type="number" 
                  className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                  defaultValue="30"
                />
              </label>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">
              Allowed Travel Classes
              <div className="mt-2 space-y-2">
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="economyClass"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    defaultChecked
                  />
                  <label htmlFor="economyClass" className="text-sm">
                    Economy (All employees)
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="premiumEconomyClass"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    defaultChecked
                  />
                  <label htmlFor="premiumEconomyClass" className="text-sm">
                    Premium Economy (For flights over 5 hours)
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="businessClass"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    defaultChecked
                  />
                  <label htmlFor="businessClass" className="text-sm">
                    Business Class (Director level and above)
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="firstClass"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="firstClass" className="text-sm">
                    First Class (C-level executives only)
                  </label>
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>
      
      <div>
        <h4 className="font-medium mb-4">Approval Workflow</h4>
        
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium">
              Approval Requirements
              <select 
                className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                defaultValue="manager_department"
              >
                <option value="manager">Manager Approval Only</option>
                <option value="manager_department">Manager and Department Head</option>
                <option value="manager_department_finance">Manager, Department Head, and Finance</option>
              </select>
            </label>
          </div>
          
          <div>
            <label className="text-sm font-medium">
              Auto-approval for requests under:
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-muted-foreground">$</span>
                </div>
                <input 
                  type="number" 
                  className="pl-6 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                  defaultValue="200"
                />
              </div>
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              id="managerNotification"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              defaultChecked
            />
            <label htmlFor="managerNotification" className="text-sm">
              Send notification to manager when request is submitted
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              id="emergencyApproval"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              defaultChecked
            />
            <label htmlFor="emergencyApproval" className="text-sm">
              Allow expedited approval for urgent requests
            </label>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end pt-4">
        <button className="btn-primary flex items-center">
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </button>
      </div>
    </div>
  );
};

const PaymentSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Manage your payment methods and billing information.
        </p>
      </div>
      
      <div className="pb-4 border-b">
        <h4 className="font-medium mb-4">Corporate Cards</h4>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 border rounded-md bg-muted/50">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-primary/10 rounded-md flex items-center justify-center text-primary">
                <CreditCard className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="font-medium">Corporate Visa</p>
                <p className="text-sm text-muted-foreground">
                  **** **** **** 5678 • Expires 05/26
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 bg-success/10 text-success text-xs rounded-full">
                Primary
              </span>
              <button className="text-sm text-muted-foreground hover:text-foreground">
                Edit
              </button>
            </div>
          </div>
          
          <div className="flex justify-between items-center p-3 border rounded-md">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-primary/10 rounded-md flex items-center justify-center text-primary">
                <CreditCard className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="font-medium">Corporate Amex</p>
                <p className="text-sm text-muted-foreground">
                  **** **** **** 2345 • Expires 08/25
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="text-sm text-muted-foreground hover:text-foreground">
                Make Primary
              </button>
              <button className="text-sm text-muted-foreground hover:text-foreground">
                Edit
              </button>
            </div>
          </div>
          
          <button className="btn-primary text-sm">
            Add Payment Method
          </button>
        </div>
      </div>
      
      <div className="pb-4 border-b">
        <h4 className="font-medium mb-4">Billing Address</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="text-sm font-medium">
              Company Name
              <input 
                type="text" 
                className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                defaultValue="Acme Corporation"
              />
            </label>
          </div>
          
          <div className="md:col-span-2">
            <label className="text-sm font-medium">
              Street Address
              <input 
                type="text" 
                className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                defaultValue="123 Business Street, Suite 100"
              />
            </label>
          </div>
          
          <div>
            <label className="text-sm font-medium">
              City
              <input 
                type="text" 
                className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                defaultValue="San Francisco"
              />
            </label>
          </div>
          
          <div>
            <label className="text-sm font-medium">
              State / Province
              <input 
                type="text" 
                className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                defaultValue="CA"
              />
            </label>
          </div>
          
          <div>
            <label className="text-sm font-medium">
              Postal Code
              <input 
                type="text" 
                className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                defaultValue="94107"
              />
            </label>
          </div>
          
          <div>
            <label className="text-sm font-medium">
              Country
              <select 
                className="mt-1 block w-full rounded-md bg-muted px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                defaultValue="us"
              >
                <option value="us">United States</option>
                <option value="ca">Canada</option>
                <option value="uk">United Kingdom</option>
                <option value="au">Australia</option>
              </select>
            </label>
          </div>
        </div>
      </div>
      
      <div>
        <h4 className="font-medium mb-4">Expense Categories</h4>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center p-2 border-b">
            <p className="font-medium">Airfare</p>
            <p className="text-muted-foreground">100-001</p>
          </div>
          
          <div className="flex justify-between items-center p-2 border-b">
            <p className="font-medium">Lodging</p>
            <p className="text-muted-foreground">100-002</p>
          </div>
          
          <div className="flex justify-between items-center p-2 border-b">
            <p className="font-medium">Ground Transportation</p>
            <p className="text-muted-foreground">100-003</p>
          </div>
          
          <div className="flex justify-between items-center p-2 border-b">
            <p className="font-medium">Meals</p>
            <p className="text-muted-foreground">100-004</p>
          </div>
          
          <div className="flex justify-between items-center p-2 border-b">
            <p className="font-medium">Entertainment</p>
            <p className="text-muted-foreground">100-005</p>
          </div>
          
          <div className="flex justify-between items-center p-2">
            <p className="font-medium">Miscellaneous</p>
            <p className="text-muted-foreground">100-006</p>
          </div>
          
          <button className="text-sm text-primary hover:text-primary-light font-medium">
            Add Expense Category
          </button>
        </div>
      </div>
      
      <div className="flex justify-end pt-4">
        <button className="btn-primary flex items-center">
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default Settings;