import React, { useState } from 'react';
import { BookOpen, FileText, CreditCard } from 'lucide-react';

type DocumentType = 'Passport' | 'Visa' | 'Aadhar';

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
            left: `calc(${tabs.findIndex(tab => tab.id === activeTab) * 33.333}% + 0.75rem + ${tabs.findIndex(tab => tab.id === activeTab) * 0.5}rem)`,
            width: `calc(33.333% - 2.3rem)`,
          }}
        />
        
        {/* Tab Buttons */}
        <div className="relative flex gap-2">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              className={`flex-1 relative z-10 flex items-center justify-center gap-2 px-4 py-4 text-sm font-semibold rounded-xl transition-all duration-300 ease-in-out transform min-w-0 ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50/50 hover:scale-105'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {/* Icon */}
              <span className="text-lg flex-shrink-0">{tab.icon}</span>
              
              {/* Label */}
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DocumentTabs