// import React from 'react';
import { DocumentType } from './types';

interface DocumentTabsProps {
  activeTab: DocumentType;
  setActiveTab: (tab: DocumentType) => void;
}

function DocumentTabs({ activeTab, setActiveTab }: DocumentTabsProps) {
  const tabs: { id: DocumentType; label: string }[] = [
    { id: 'passport', label: 'Passport' },
    { id: 'visa', label: 'Visa' },
    { id: 'aadhar', label: 'Aadhar' },
  ];

  return (
    <div className="border-b border-gray-200 mb-6">
      <div className="flex space-x-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default DocumentTabs;