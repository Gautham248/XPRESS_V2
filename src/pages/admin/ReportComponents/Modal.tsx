import React from 'react';
import { Download, X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  startDate?: string;
  endDate?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, startDate, endDate }) => {
  if (!isOpen) return null;

  const formatDate = (date?: string): string => {
    if (!date) return 'Not specified';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Construct date range text based on the report's filtered date range
  const dateRangeText: string = startDate || endDate 
    ? `Report Date Range: ${startDate ? formatDate(startDate) : 'Start'} to ${endDate ? formatDate(endDate) : 'End'}`
    : 'Report Date Range: All Time';

  const handleExport = () => {
    // Implement export functionality here
    // For now, we'll just close the modal
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-screen overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-96">
          <div className="mb-4 text-sm text-gray-600">
            {dateRangeText}
          </div>
          {children}
        </div>
        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button 
            onClick={handleExport}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;