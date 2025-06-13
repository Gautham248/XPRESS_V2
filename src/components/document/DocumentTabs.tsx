import React from 'react';
import { DocumentType } from './types';
import { BookOpen, FileText, CreditCard } from 'lucide-react';

interface DocumentTabsProps {
  activeTab: DocumentType;
  setActiveTab: (tab: DocumentType) => void;
}

function DocumentTabs({ activeTab, setActiveTab }: DocumentTabsProps) {
  const tabs: { id: DocumentType; label: string; icon: React.ReactElement }[] = [
    { id: 'Passport', label: 'Passport', icon: <BookOpen size={18} /> },
    { id: 'Visa', label: 'Visa', icon: <FileText size={18} /> },
    { id: 'Aadhar', label: 'Aadhar', icon: <CreditCard size={18} /> },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      {/* Tab Container with Glass Effect */}
      <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-gray-200/50">
        {/* Background Slider */}
        <div 
          className="absolute top-2 bottom-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-md transition-all duration-300 ease-in-out"
          style={{
            left: `${tabs.findIndex(tab => tab.id === activeTab) * (100 / tabs.length)}%`,
            width: `${100 / tabs.length}%`,
            transform: 'translateX(0.5rem) scaleX(calc(1 - 1rem / 100%))'
          }}
        />
        
        {/* Tab Buttons */}
        <div className="relative flex">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              className={`flex-1 relative z-10 flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold rounded-xl transition-all duration-300 ease-in-out transform hover:scale-105 ${
                activeTab === tab.id
                  ? 'text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50/50'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {/* Icon */}
              <span className="text-lg">{tab.icon}</span>
              
              {/* Label */}
              <span className="font-medium">{tab.label}</span>
              
              {/* Active Indicator Dot */}
              {activeTab === tab.id && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-sm" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DocumentTabs;