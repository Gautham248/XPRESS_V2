import React from 'react';

interface EmptyStateViewProps {
  icon?: React.ReactNode;
  title: string;
  message: string;
}

const EmptyStateView: React.FC<EmptyStateViewProps> = ({ 
  icon, 
  title, 
  message 
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-80">
      <div className="text-gray-400 mb-4">
        {icon || (
          <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21.5 12H6.5M21.5 12L16.5 7M21.5 12L16.5 17M6.5 12L2.5 18M6.5 12L2.5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <h3 className="text-lg font-medium text-gray-500">{title}</h3>
      <p className="text-sm text-gray-400 mt-2">{message}</p>
    </div>
  );
};

export default EmptyStateView;