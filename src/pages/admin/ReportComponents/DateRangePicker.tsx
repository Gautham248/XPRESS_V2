import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronDown, X } from 'lucide-react';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const formatDisplayDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  const displayText = startDate && endDate
    ? `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`
    : startDate
    ? `From ${formatDisplayDate(startDate)}`
    : endDate
    ? `Until ${formatDisplayDate(endDate)}`
    : "Select date range";
    
  return (
    <div className="relative">
      <div 
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-md cursor-pointer border border-gray-200 hover:border-gray-300"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Calendar className="h-4 w-4 text-gray-600" />
        <span className="text-sm text-gray-800">{displayText}</span>
        <ChevronDown className="h-4 w-4 text-gray-600 ml-2" />
      </div>
      
      {isOpen && (
        <div 
          ref={datePickerRef}
          className="absolute mt-2 z-20 bg-white rounded-md shadow-lg border border-gray-200 p-4 w-80 opacity-100"
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-gray-800">Select Date Range</h3>
            <button 
              onClick={() => setIsOpen(false)} 
              className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-between">
            <button 
              onClick={() => {
                onStartDateChange('');
                onEndDateChange('');
                setIsOpen(false);
              }}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
            >
              Clear
            </button>
            <button 
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;