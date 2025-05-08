import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  ArrowLeft,
  Search,
  HelpCircle
} from 'lucide-react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center animate-fadeIn">
      <div className="text-6xl font-bold text-primary mb-6">404</div>
      <h1 className="text-2xl font-semibold mb-2">Page Not Found</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        We couldn't find the page you were looking for. The page may have been moved, deleted, or never existed.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <button 
          className="btn-primary flex items-center justify-center"
          onClick={() => navigate('/')}
        >
          <Home className="h-4 w-4 mr-2" />
          Go to Dashboard
        </button>
        
        <button 
          className="btn-secondary flex items-center justify-center"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
        <div className="card hover:shadow-elevation-3 transition-all p-4">
          <div className="flex flex-col items-center">
            <div className="p-3 rounded-full bg-primary/10 mb-4">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium mb-2">Search for Content</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Try searching for the content you were looking for.
            </p>
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 rounded-md bg-muted w-full focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="card hover:shadow-elevation-3 transition-all p-4">
          <div className="flex flex-col items-center">
            <div className="p-3 rounded-full bg-primary/10 mb-4">
              <HelpCircle className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium mb-2">Need Help?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Our support team is here to help you find what you need.
            </p>
            <button className="btn-primary text-sm w-full">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;