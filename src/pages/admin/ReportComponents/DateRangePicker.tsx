import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronDown, X, AlertCircle } from 'lucide-react';

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
  onEndDateChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [validationError, setValidationError] = useState('');
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Validate date range
  const validateDateRange = (start: string, end: string): string => {
    if (start && end && new Date(start) > new Date(end)) {
      return 'End date must be on or after the start date';
    }
    return '';
  };

  // Update validation when dates change
  useEffect(() => {
    const error = validateDateRange(startDate, endDate);
    setValidationError(error);
  }, [startDate, endDate]);

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
      year: 'numeric',
    });
  };

  const displayText = startDate && endDate
    ? `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`
    : startDate
    ? `From ${formatDisplayDate(startDate)}`
    : endDate
    ? `Until ${formatDisplayDate(endDate)}`
    : "Select date range";

  const handleStartDateChange = (date: string) => {
    onStartDateChange(date);
    // If end date is before the new start date, clear it
    if (date && endDate && new Date(date) > new Date(endDate)) {
      onEndDateChange('');
    }
  };

  const handleEndDateChange = (date: string) => {
    // Only allow end date if it's on or after start date
    if (!startDate || !date || new Date(date) >= new Date(startDate)) {
      onEndDateChange(date);
    }
  };

  const hasValidationError = validationError !== '';
  const endDateHasError = hasValidationError && endDate !== '';

  return (
    <div className="relative z-30">
      <div
        className={`flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-md cursor-pointer border transition-colors ${
          hasValidationError
            ? 'border-red-300 hover:border-red-400'
            : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Calendar className={`h-4 w-4 ${hasValidationError ? 'text-red-600' : 'text-gray-600'}`} />
        <span className={`text-sm ${hasValidationError ? 'text-red-800' : 'text-gray-800'}`}>
          {displayText}
        </span>
        {hasValidationError && <AlertCircle className="h-4 w-4 text-red-600" />}
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

          {validationError && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-xs text-red-700">{validationError}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className={`w-full p-2 border rounded-md text-sm bg-white placeholder-gray-400 transition-colors ${
                  endDateHasError
                    ? 'border-red-300 text-red-800 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-red-50'
                    : 'border-gray-300 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                }`}
                disabled={!startDate}
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
              className="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700"
            >
              Clear
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className={`px-3 py-1 text-white text-sm rounded-md transition-colors ${
                hasValidationError
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
              disabled={hasValidationError}
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