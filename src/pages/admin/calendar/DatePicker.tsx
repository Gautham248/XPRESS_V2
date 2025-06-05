import React, { useState, useEffect, useRef, useCallback } from 'react';

interface DatePickerProps {
  currentDate: Date;
  view: 'Month' | 'Week';
  onDateSelect: (year: number, month: number, day?: number) => void;
  formatWeekRange: () => string;
}

interface PickerDisplayDayInfo {
  day: number;
  isCurrentMonth: boolean;
  month: number;
  year: number;
  date: Date;
}

const DatePicker: React.FC<DatePickerProps> = ({ currentDate, view, onDateSelect, formatWeekRange }) => {
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [pickerDate, setPickerDate] = useState<Date>(new Date(currentDate));
  const [pickerView, setPickerView] = useState<'Days' | 'Months' | 'Years'>('Months'); // Start with Months view
  const datePickerRef = useRef<HTMLDivElement | null>(null);

  const monthsArray: string[] = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const weekdayNames: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Sync pickerDate with currentDate whenever currentDate changes
  useEffect(() => {
    const normalizedCurrentDate = new Date(currentDate);
    normalizedCurrentDate.setHours(0, 0, 0, 0);
    setPickerDate(new Date(normalizedCurrentDate));
  }, [currentDate]);

  const getDaysForPickerGrid = useCallback((year: number, month: number): PickerDisplayDayInfo[] => {
    const days: PickerDisplayDayInfo[] = [];
    const firstDayOfMonth = new Date(year, month, 1);
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());

    for (let i = 0; i < 42; i++) {
      const currentIterDate = new Date(startDate);
      currentIterDate.setDate(startDate.getDate() + i);
      days.push({
        day: currentIterDate.getDate(),
        isCurrentMonth: currentIterDate.getMonth() === month,
        month: currentIterDate.getMonth(),
        year: currentIterDate.getFullYear(),
        date: new Date(currentIterDate),
      });
    }
    return days;
  }, []);

  const handlePickerDayGridSelect = (selectedFullDate: Date): void => {
    const normalizedSelectedDate = new Date(selectedFullDate);
    normalizedSelectedDate.setHours(0, 0, 0, 0);
    setPickerDate(new Date(normalizedSelectedDate));
    onDateSelect(
      normalizedSelectedDate.getFullYear(),
      normalizedSelectedDate.getMonth(),
      normalizedSelectedDate.getDate()
    );
    setShowPicker(false);
  };

  const handleMonthGridMonthSelect = (monthIndex: number): void => {
    const newDate = new Date(pickerDate.getFullYear(), monthIndex, 1);
    newDate.setHours(0, 0, 0, 0);
    setPickerDate(newDate);
    
    // If Month view, select the month without asking for day
    if (view === 'Month') {
      onDateSelect(newDate.getFullYear(), monthIndex);
      setShowPicker(false);
    } else {
      // If Week view, go to day selection
      setPickerView('Days');
    }
  };

  const handleYearGridYearSelect = (year: number): void => {
    setPickerDate(prev => {
      const newDate = new Date(year, prev.getMonth(), 1);
      newDate.setHours(0, 0, 0, 0);
      return newDate;
    });
    setPickerView('Months');
  };

  const navigateYearInMonthGrid = (amount: number): void => {
    setPickerDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(1);
      newDate.setFullYear(newDate.getFullYear() + amount);
      newDate.setHours(0, 0, 0, 0);
      return newDate;
    });
  };

  const navigateDecadeInYearGrid = (amount: number): void => {
    setPickerDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(1);
      newDate.setFullYear(newDate.getFullYear() + amount * 10);
      newDate.setHours(0, 0, 0, 0);
      return newDate;
    });
  };

  const navigateMonthInDayGrid = (amount: number): void => {
    setPickerDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(1);
      newDate.setMonth(newDate.getMonth() + amount);
      newDate.setHours(0, 0, 0, 0);
      return newDate;
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
        setPickerView('Months'); // Reset to months view
      }
    };
    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPicker]);

  const today = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const todayIST = new Date(today.getTime() + istOffset);
  todayIST.setHours(0, 0, 0, 0);

  const formatMonth = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const renderYearSelectionGrid = (): JSX.Element => {
    const currentYear = pickerDate.getFullYear();
    const startYear = Math.floor(currentYear / 10) * 10 - 1;
    const years: number[] = Array.from({ length: 12 }, (_, i) => startYear + i);

    return (
      <div className="absolute top-12 left-0 z-10 p-4 bg-white border rounded-lg shadow-lg w-72">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-800 font-semibold text-lg">{`${startYear} - ${startYear + 11}`}</span>
          <div className="flex space-x-2">
            <button
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
              onClick={() => navigateDecadeInYearGrid(-1)}
              aria-label="Previous decade"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
              onClick={() => navigateDecadeInYearGrid(1)}
              aria-label="Next decade"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {years.map(year => {
            const isCurrentYear = currentDate.getFullYear() === year;
            return (
              <button
                key={year}
                className={`h-12 flex items-center justify-center rounded-lg cursor-pointer text-sm font-medium transition-all duration-200 ${
                  isCurrentYear 
                    ? 'bg-blue-500 text-white shadow-md' 
                    : 'bg-gray-50 text-gray-800 hover:bg-blue-50 hover:text-blue-600'
                }`}
                onClick={() => handleYearGridYearSelect(year)}
              >
                {year}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMonthSelectionGrid = (): JSX.Element => {
    return (
      <div className="absolute top-12 left-0 z-10 p-4 bg-white border rounded-lg shadow-lg w-72">
        <div className="flex items-center mb-4 space-x-2">
          <div className="flex space-x-2">
            <button
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
              onClick={() => navigateYearInMonthGrid(-1)}
              aria-label="Previous year"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
              onClick={() => navigateYearInMonthGrid(1)}
              aria-label="Next year"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <button
            className="text-gray-800 font-semibold text-lg hover:text-blue-600 cursor-pointer transition-colors duration-200"
            onClick={() => setPickerView('Years')}
          >
            {pickerDate.getFullYear()}
          </button>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {monthsArray.map((monthName, index) => {
            const isActualCurrentMonthAndYear =
              currentDate.getMonth() === index &&
              currentDate.getFullYear() === pickerDate.getFullYear();

            return (
              <button
                key={monthName}
                className={`h-12 flex items-center justify-center rounded-lg cursor-pointer text-sm font-medium transition-all duration-200 ${
                  isActualCurrentMonthAndYear 
                    ? 'bg-blue-500 text-white shadow-md' 
                    : 'bg-gray-50 text-gray-800 hover:bg-blue-50 hover:text-blue-600'
                }`}
                onClick={() => handleMonthGridMonthSelect(index)}
              >
                {monthName}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDaySelectionGrid = (): JSX.Element => {
    const daysToDisplay = getDaysForPickerGrid(pickerDate.getFullYear(), pickerDate.getMonth());
    const normalizedCurrentDate = new Date(currentDate);
    normalizedCurrentDate.setHours(0, 0, 0, 0);

    return (
      <div className="absolute top-12 left-0 z-10 p-4 bg-white border rounded-lg shadow-lg w-80">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-2">
              <button
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                onClick={() => navigateMonthInDayGrid(-1)}
                aria-label="Previous month"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                onClick={() => navigateMonthInDayGrid(1)}
                aria-label="Next month"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <button
              className="text-gray-800 font-semibold text-lg hover:text-blue-600 cursor-pointer transition-colors duration-200"
              onClick={() => setPickerView('Months')}
            >
              {pickerDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekdayNames.map((day: string) => (
            <div key={day} className="text-center text-gray-600 font-medium text-sm py-2">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {daysToDisplay.map((dayInfo, idx) => {
            const dayDateNormalized = new Date(dayInfo.date);
            dayDateNormalized.setHours(0, 0, 0, 0);

            const isSelectedOnMainCalendar = dayDateNormalized.getTime() === normalizedCurrentDate.getTime();
            const isTodayCell = dayDateNormalized.getTime() === todayIST.getTime();

            return (
              <button
                key={`picker-day-${idx}`}
                className={`h-10 flex items-center justify-center rounded-lg cursor-pointer text-sm font-medium transition-all duration-200
                  ${dayInfo.isCurrentMonth 
                    ? 'text-gray-900 hover:bg-gray-100' 
                    : 'text-gray-400 opacity-50 hover:opacity-75'}
                  ${isSelectedOnMainCalendar 
                    ? 'bg-blue-500 text-white shadow-md' 
                    : isTodayCell 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-white border border-gray-200'}`}
                onClick={() => handlePickerDayGridSelect(dayInfo.date)}
              >
                {dayInfo.day}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const togglePicker = () => {
    if (!showPicker) {
      const normalizedCurrentDate = new Date(currentDate);
      normalizedCurrentDate.setHours(0, 0, 0, 0);
      setPickerDate(new Date(normalizedCurrentDate));
      setPickerView('Months'); // Always start with months view
    }
    setShowPicker(!showPicker);
  };

  return (
    <div className="relative mr-4 flex-shrink-0" ref={datePickerRef}>
      <button
        className="p-3 flex items-center text-gray-700 hover:text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm"
        onClick={togglePicker}
        aria-haspopup="true"
        aria-expanded={showPicker}
        aria-controls="datepicker-popup-grid"
      >
        <svg
          className="w-5 h-5 mr-3 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2z"
          />
        </svg>
        <span className="text-lg font-medium truncate">
          {view === 'Month' ? formatMonth(currentDate) : formatWeekRange()}
        </span>
        <svg className="w-4 h-4 ml-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showPicker && (
        <div id="datepicker-popup-grid">
          {pickerView === 'Years'
            ? renderYearSelectionGrid()
            : pickerView === 'Months'
            ? renderMonthSelectionGrid()
            : renderDaySelectionGrid()}
        </div>
      )}
    </div>
  );
};

// Demo component to show the DatePicker in action
const DatePickerDemo = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'Month' | 'Week'>('Month');

  const handleDateSelect = (year: number, month: number, day?: number) => {
    if (day !== undefined) {
      setCurrentDate(new Date(year, month, day));
    } else {
      // For month view, set to first day of selected month
      setCurrentDate(new Date(year, month, 1));
    }
  };

  const formatWeekRange = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Travel Calendar</h1>
        
        <div className="mb-6 flex space-x-2">
          <button
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
              view === 'Month' 
                ? 'bg-blue-500 text-white shadow-md' 
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => setView('Month')}
          >
            Month
          </button>
          <button
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
              view === 'Week' 
                ? 'bg-blue-500 text-white shadow-md' 
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => setView('Week')}
          >
            Week
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <DatePicker
              currentDate={currentDate}
              view={view}
              onDateSelect={handleDateSelect}
              formatWeekRange={formatWeekRange}
            />
            
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-800">
                {currentDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Current view: {view}
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">Events</h3>
            <div className="flex items-center text-blue-600">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              <span className="text-sm">No events scheduled for this date.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatePicker;