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
      
   
    </div>
  );
};

export default NotFound;