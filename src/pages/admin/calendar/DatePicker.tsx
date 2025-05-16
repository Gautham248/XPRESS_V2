import { useState, useEffect, useRef } from 'react';

interface DatePickerProps {
  currentDate: Date;
  view: 'Month' | 'Week';
  onDateSelect: (day: number, month: number, year: number) => void;
  formatWeekRange: () => string;
}

interface DayInfo {
  day: number;
  currentMonth: boolean;
  month: number;
  year: number;
}

const DatePicker: React.FC<DatePickerProps> = ({ currentDate, view, onDateSelect, formatWeekRange }) => {
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [pickerDate, setPickerDate] = useState<Date>(new Date(currentDate));
  const [pickerView, setPickerView] = useState<'Days' | 'Months'>('Days');
  const datePickerRef = useRef<HTMLDivElement | null>(null);

  const monthsArray: string[] = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  const weekdayNames: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysForMonth = (year: number, month: number): DayInfo[] => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const prevMonthDays: DayInfo[] = Array.from({ length: firstDayOfMonth }, (_, i) => ({
      day: daysInPrevMonth - firstDayOfMonth + i + 1,
      currentMonth: false,
      month: month - 1 < 0 ? 11 : month - 1,
      year: month - 1 < 0 ? year - 1 : year,
    }));

    const currentMonthDays: DayInfo[] = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      currentMonth: true,
      month: month,
      year: year,
    }));

    const totalDaysDisplayed = 42;
    const nextMonthDays: DayInfo[] = Array.from(
      { length: totalDaysDisplayed - (prevMonthDays.length + currentMonthDays.length) },
      (_, i) => ({
        day: i + 1,
        currentMonth: false,
        month: month + 1 > 11 ? 0 : month + 1,
        year: month + 1 > 11 ? year + 1 : year,
      })
    );

    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };

  const pickerMonthDays: DayInfo[] = getDaysForMonth(pickerDate.getFullYear(), pickerDate.getMonth());

  const handlePickerPrevYear = (): void => {
    setPickerDate(new Date(pickerDate.getFullYear() - 1, pickerDate.getMonth(), 1));
  };

  const handlePickerNextYear = (): void => {
    setPickerDate(new Date(pickerDate.getFullYear() + 1, pickerDate.getMonth(), 1));
  };

  const handlePickerMonthSelect = (month: number): void => {
    const newDate = new Date(pickerDate.getFullYear(), month, 1);
    setPickerDate(newDate);
    if (view === 'Month') {
      onDateSelect(1, month, pickerDate.getFullYear());
      setShowDatePicker(false);
    } else {
      setPickerView('Days');
    }
  };

  const handlePickerDateSelect = (day: number, month: number, year: number): void => {
    onDateSelect(day, month, year);
    setShowDatePicker(false);
  };

  const formatMonth = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const today = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const todayIST = new Date(today.getTime() + istOffset);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
        setPickerView('Days');
      }
    };
    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDatePicker]);

  const renderMonthSelectionGrid = (): JSX.Element => {
    return (
      <div className="absolute top-12 left-0 z-10 p-3 bg-white border rounded-md shadow-md w-64">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-800 font-medium">{pickerDate.getFullYear()}</span>
          <div className="flex space-x-2">
            <button
              className="p-1 text-gray-600 hover:text-gray-800"
              onClick={handlePickerPrevYear}
            >
              {'<'}
            </button>
            <button
              className="p-1 text-gray-600 hover:text-gray-800"
              onClick={handlePickerNextYear}
            >
              {'>'}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {monthsArray.map((month: string, index: number) => {
            const isCurrentMonth =
              currentDate.getMonth() === index &&
              currentDate.getFullYear() === pickerDate.getFullYear();
            return (
              <div
                key={month}
                className={`h-10 flex items-center justify-center rounded-md cursor-pointer text-sm ${
                  isCurrentMonth ? 'bg-blue-500 text-white' : 'bg-gray-50 text-gray-800'
                } hover:bg-blue-100 hover:text-blue-800`}
                onClick={() => handlePickerMonthSelect(index)}
              >
                <span>{month}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDatePickerDaysGrid = (): JSX.Element => {
    return (
      <div className="absolute top-12 left-0 z-10 p-3 bg-white border rounded-md shadow-md w-64">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-800 font-medium">
            {pickerDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button
            className="ml-1 p-1 text-gray-600 hover:text-gray-800"
            onClick={() => setPickerView('Months')}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 15l7-7 7 7"
              />
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {weekdayNames.map((day: string) => (
            <div key={day} className="text-center text-gray-600 font-medium text-xs">
              {day.charAt(0)}
            </div>
          ))}
          {pickerMonthDays.map((dayInfo: DayInfo, idx: number) => {
            const isToday =
              dayInfo.year === todayIST.getFullYear() &&
              dayInfo.month === todayIST.getMonth() &&
              dayInfo.day === todayIST.getDate();
            return (
              <div
                key={`picker-day-${idx}`}
                className={`h-6 flex items-center justify-center rounded-md cursor-pointer text-xs
                  ${dayInfo.currentMonth ? 'bg-white border border-gray-200 shadow-sm font-medium text-gray-900' : 'bg-gray-100 text-gray-400 opacity-50'}
                  ${isToday ? 'bg-blue-200 text-blue-800' : ''}
                  hover:bg-gray-200 hover:shadow-sm transition-all duration-200`}
                onClick={() => handlePickerDateSelect(dayInfo.day, dayInfo.month, dayInfo.year)}
              >
                <span>{dayInfo.day}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="relative mr-4 flex-shrink-0" ref={datePickerRef}>
      <button
        className="p-2 flex items-center text-gray-600 hover:text-gray-800"
        onClick={() => {
          if (showDatePicker) {
            setShowDatePicker(false);
          } else {
            setShowDatePicker(true);
            setPickerDate(new Date(currentDate));
            setPickerView('Months');
          }
        }}
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span className="text-lg truncate">{view === 'Month' ? formatMonth(currentDate) : formatWeekRange()}</span>
      </button>
      {showDatePicker && (
        pickerView === 'Months' ? renderMonthSelectionGrid() : renderDatePickerDaysGrid()
      )}
    </div>
  );
};

export default DatePicker;