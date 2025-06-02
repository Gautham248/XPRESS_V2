import React from 'react';
import { Download, X } from 'lucide-react';
import { exportData } from './exportData';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  startDate?: string;
  endDate?: string;
  exportData?: {
    headers: string[];
    data: Record<string, any>[];
    filename?: string;
  };
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  startDate, 
  endDate,
  exportData: exportConfig
}) => {
  if (!isOpen) return null;

  const formatDate = (date?: string): string => {
    if (!date) return 'Not specified';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get current UTC date as string
  const getCurrentUTCDate = (): string => {
    return new Date().toISOString().split('T')[0]; // Returns YYYY-MM-DD format
  };

  // Construct date range text based on the report's filtered date range
  const dateRangeText: string = startDate || endDate 
    ? `Report Date Range: ${startDate ? formatDate(startDate) : 'Start'} to ${endDate ? formatDate(endDate) : formatDate(getCurrentUTCDate())}`
    : 'Report Date Range: All Time';

  // Extract travel type filter from title for export button label
  const getExportButtonLabel = (): string => {
    if (title.includes('International Flights')) {
      return 'Export International Data';
    } else if (title.includes('Domestic Flights')) {
      return 'Export Domestic Data';
    } else {
      return 'Export All Data';
    }
  };

  const handleExport = async () => {
    if (!exportConfig) {
      console.warn('Export configuration not provided');
      return;
    }

    try {
      await exportData({
        filename: exportConfig.filename || 'travel-data',
        headers: exportConfig.headers,
        data: exportConfig.data,
        title,
        dateRange: dateRangeText
      });
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    }
  };

return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col border border-gray-200">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors duration-200"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="text-sm font-medium text-gray-700">
            {dateRangeText}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="p-6">
            {children}
          </div>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button 
            onClick={handleExport}
            disabled={!exportConfig}
            className={`px-6 py-2.5 rounded-lg flex items-center font-medium transition-colors duration-200 ${
              exportConfig 
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Download className="h-4 w-4 mr-2" />
            {getExportButtonLabel()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;