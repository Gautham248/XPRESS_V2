import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-card border-t py-4 px-6">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Xpress . All rights reserved.
        </div>
        {/* <div className="mt-2 md:mt-0 flex space-x-4">
          <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Terms of Service
          </a>
          <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Help Center
          </a>
        </div> */}
      </div>
    </footer>
  );
};

export default Footer;