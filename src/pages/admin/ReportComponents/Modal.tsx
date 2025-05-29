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

  // Construct date range text based on the report's filtered date range
  const dateRangeText: string = startDate || endDate 
    ? `Report Date Range: ${startDate ? formatDate(startDate) : 'Start'} to ${endDate ? formatDate(endDate) : 'Today'}`
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
            disabled={!exportConfig}
            className={`px-4 py-2 rounded-md flex items-center ${
              exportConfig 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
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