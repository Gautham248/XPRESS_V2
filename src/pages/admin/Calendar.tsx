import React, { useState, useEffect, useRef } from 'react';
import { TravelRequest, mockTravelRequests } from '../../data/mockData';

const Calendar: React.FC = () => {
  // Get current date and convert to IST
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
    return new Date(now.getTime() + istOffset);
  });
  const [view, setView] = useState<'Month' | 'Week'>('Month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [pickerDate, setPickerDate] = useState<Date>(() => {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    return new Date(now.getTime() + istOffset);
  });
  const [pickerView, setPickerView] = useState<'Days' | 'Months'>('Days');

  // Ref for the date picker to handle click outside
  const datePickerRef = useRef<HTMLDivElement | null>(null);

  // Filter travel requests with status 'Tickets Selected'
  const filteredRequests = mockTravelRequests.filter(
    (request) => request.status === 'Tickets Selected'
  );

  // Function to get events for a specific date (only for departure or return dates)
  const getEventsForDate = (date: Date): TravelRequest[] => {
    return filteredRequests.filter((request) => {
      const depDate = new Date(request.departureDate);
      const retDate = new Date(request.returnDate);
      const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      return (
        depDate.toDateString() === checkDate.toDateString() ||
        retDate.toDateString() === checkDate.toDateString()
      );
    });
  };

  // Get days in the current month for the main calendar
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanksBefore = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  // Get days in the current week for the main calendar
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    return day;
  });

  // Get days for the date picker calendar
  const pickerDaysInMonth = new Date(pickerDate.getFullYear(), pickerDate.getMonth() + 1, 0).getDate();
  const pickerFirstDayOfMonth = new Date(pickerDate.getFullYear(), pickerDate.getMonth(), 1).getDay();
  const pickerDaysArray = Array.from({ length: pickerDaysInMonth }, (_, i) => i + 1);
  const pickerBlanksBefore = Array.from({ length: pickerFirstDayOfMonth }, (_, i) => i);

  // Array of month names for the months view
  const monthsArray = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // Handle previous/next month or week for the main calendar
  const handlePrev = (): void => {
    if (view === 'Month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7));
    }
    setSelectedDate(null);
  };

  const handleNext = (): void => {
    if (view === 'Month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7));
    }
    setSelectedDate(null);
  };

  // Handle previous/next year for the date picker
  const handlePickerPrevYear = (): void => {
    setPickerDate(new Date(pickerDate.getFullYear() - 1, pickerDate.getMonth(), 1));
  };

  const handlePickerNextYear = (): void => {
    setPickerDate(new Date(pickerDate.getFullYear() + 1, pickerDate.getMonth(), 1));
  };

  // Handle month selection in the months view
  const handlePickerMonthSelect = (month: number): void => {
    const newDate = new Date(pickerDate.getFullYear(), month, 1);
    setPickerDate(newDate);
    if (view === 'Month') {
      // When in Month view, apply the month/year selection immediately and close the picker
      setCurrentDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
      setShowDatePicker(false);
    } else {
      // For Week view, proceed to day selection
      setPickerView('Days');
    }
  };

  // Handle date selection from the date picker
  const handlePickerDateSelect = (day: number): void => {
    const selected = new Date(pickerDate.getFullYear(), pickerDate.getMonth(), day);
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(selected.getTime() + istOffset);

    if (view === 'Month') {
      setCurrentDate(new Date(istDate.getFullYear(), istDate.getMonth(), 1));
    } else {
      // For week view, set the date to the start of the week
      const dayOfWeek = istDate.getDay();
      const startOfSelectedWeek = new Date(istDate);
      startOfSelectedWeek.setDate(istDate.getDate() - dayOfWeek);
      setCurrentDate(startOfSelectedWeek);
    }
    setSelectedDate(null);
    setShowDatePicker(false);
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  // Format month for display
  const formatMonth = (date: Date = currentDate): string => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Format week range for display
  const formatWeekRange = (): string => {
    const start = weekDays[0];
    const end = weekDays[6];
    return `${start.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}, ${end.getFullYear()}`;
  };

  // Handle date click on the main calendar
  const handleDateClick = (date: Date): void => {
    setSelectedDate(date);
  };

  // Get today's date in IST for comparison
  const today = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const todayIST = new Date(today.getTime() + istOffset);

  // Handle view change and adjust currentDate if a date is selected
  const handleViewChange = (newView: 'Month' | 'Week'): void => {
    if (selectedDate && newView === 'Week') {
      // When switching to week view, set currentDate to the start of the week containing selectedDate
      const dayOfWeek = selectedDate.getDay();
      const startOfSelectedWeek = new Date(selectedDate);
      startOfSelectedWeek.setDate(selectedDate.getDate() - dayOfWeek);
      setCurrentDate(startOfSelectedWeek);
    }
    setView(newView);
  };

  // Handle click outside to close date picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
        setPickerView('Days'); // Reset to days view when closing
      }
    };
    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDatePicker]);

  // Render month selection grid
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
          {monthsArray.map((month, index) => {
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

  // Render event box for week view
  const renderEventBox = (event: TravelRequest, day: Date): JSX.Element => {
    const isDeparture = new Date(event.departureDate).toDateString() === day.toDateString();
    const isReturn = new Date(event.returnDate).toDateString() === day.toDateString();
    
    return (
      <div
      className={`${
        isDeparture 
          ? 'bg-blue-50 border-l-4 border-blue-500' 
          : isReturn 
            ? 'bg-green-50 border-l-4 border-green-500' 
            : 'bg-gray-50 border-l-4 border-gray-500'
      } px-1 py-3 rounded-md text-sm mt-1 shadow-sm hover:shadow transition-shadow duration-200`}
    >
        <div className={`font-medium ${isDeparture ? 'text-blue-700' : isReturn ? 'text-green-700' : 'text-gray-700'} mb-2`}>
        {isDeparture ? ' Departure' : ' Return' }
      </div>
      
      <div className="text-xs text-gray-600">{event.travelerName}</div>
    </div>
    );
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Travel Calendar</h1>
      </div>
      
      <div className="flex gap-4">
        {/* Main calendar area */}
        <div className="flex-[0.65] bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center mb-4">
            <div className="relative mr-4" ref={datePickerRef}>
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
                <span className="text-lg">{view === 'Month' ? formatMonth() : formatWeekRange()}</span>
              </button>
              {showDatePicker && (
                pickerView === 'Months' ? renderMonthSelectionGrid() : (
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
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                        <div key={day} className="text-center text-gray-600 font-medium text-xs">
                          {day}
                        </div>
                      ))}
                      {pickerBlanksBefore.map((_, index) => (
                        <div key={`picker-blank-${index}`} className="h-6 bg-gray-50 rounded-md"></div>
                      ))}
                      {pickerDaysArray.map((day) => {
                        const date = new Date(pickerDate.getFullYear(), pickerDate.getMonth(), day);
                        const isToday =
                          date.getFullYear() === todayIST.getFullYear() &&
                          date.getMonth() === todayIST.getMonth() &&
                          day === todayIST.getDate();

                        return (
                          <div
                            key={day}
                            className={`h-6 flex items-center justify-center rounded-md cursor-pointer text-xs ${
                              isToday ? 'bg-blue-200' : 'bg-gray-50'
                            } hover:bg-gray-200 hover:shadow-sm transition-all duration-200`}
                            onClick={() => handlePickerDateSelect(day)}
                          >
                            <span className="text-gray-800">{day}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
              )}
            </div>
            
            <div className="flex items-center">
              <button
                className="px-2 py-1 text-gray-600 hover:text-gray-800"
                onClick={handlePrev}
              >
                {'<'}
              </button>
              <button
                className="px-2 py-1 text-gray-600 hover:text-gray-800"
                onClick={handleNext}
              >
                {'>'}
              </button>
            </div>
            
            <div className="ml-auto">
              <div className="flex space-x-2">
                <button
                  className={`px-4 py-2 rounded-md ${view === 'Month' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                  onClick={() => handleViewChange('Month')}
                >
                  Month
                </button>
                <button
                  className={`px-4 py-2 rounded-md ${view === 'Week' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                  onClick={() => handleViewChange('Week')}
                >
                  Week
                </button>
              </div>
            </div>
          </div>

          {view === 'Month' ? (
            <div>
              <div className="grid grid-cols-7 gap-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-gray-600 font-medium">
                    {day}
                  </div>
                ))}
                {blanksBefore.map((_, index) => (
                  <div key={`blank-${index}`} className="h-16 bg-gray-50 rounded-md"></div>
                ))}
                {daysArray.map((day) => {
                  const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                  const events = getEventsForDate(date);
                  const isSelected =
                    selectedDate &&
                    selectedDate.getFullYear() === date.getFullYear() &&
                    selectedDate.getMonth() === date.getMonth() &&
                    selectedDate.getDate() === date.getDate();
                  const isToday =
                    date.getFullYear() === todayIST.getFullYear() &&
                    date.getMonth() === todayIST.getMonth() &&
                    day === todayIST.getDate();

                  return (
                    <div
                      key={day}
                      className={`h-16 flex flex-col p-1 rounded-md cursor-pointer relative ${
                        isSelected ? 'bg-blue-100' : 'bg-gray-50'
                      } ${isToday ? 'bg-blue-200' : ''} hover:bg-gray-200 hover:shadow-sm hover:border hover:border-gray-300 transition-all duration-200`}
                      onClick={() => handleDateClick(date)}
                    >
                      <span className="text-gray-800 text-center">{day}</span>
                      {events.length > 0 && (
                        <div className="absolute bottom-1.5 right-1 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
                          {events.length}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day, index) => {
                  const events = getEventsForDate(day);
                  const isSelected =
                    selectedDate &&
                    selectedDate.getFullYear() === day.getFullYear() &&
                    selectedDate.getMonth() === day.getMonth() &&
                    selectedDate.getDate() === day.getDate();
                  const isToday =
                    day.getFullYear() === todayIST.getFullYear() &&
                    day.getMonth() === todayIST.getMonth() &&
                    day.getDate() === todayIST.getDate();

                  return (
                    <div key={index} className="flex flex-col">
                      <div className="text-center text-gray-600 font-medium">
                        {day.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div
                        className={`h-10 flex items-center justify-center rounded-md cursor-pointer ${
                          isSelected ? 'bg-blue-100' : 'bg-gray-50'
                        } ${isToday ? 'bg-blue-200' : ''} hover:bg-gray-200 hover:shadow-sm hover:border hover:border-gray-300 transition-all duration-200`}
                        onClick={() => handleDateClick(day)}
                      >
                        <span className="text-gray-800 text-lg">{day.getDate()}</span>
                      </div>
                      <div className="mt-2 flex flex-col space-y-1 min-h-48">
                        {events.length > 0 ? (
                          events.map((event, idx) => (
                            <div key={idx} className="mb-1">
                              {renderEventBox(event, day)}
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-500 text-sm text-center py-2">No events</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Events sidebar */}
        <div className="flex-[0.35] bg-white rounded-lg shadow-sm border border-gray-100 p-4 h-fit">
          <div className="flex items-center mb-4">
            <svg
              className="w-5 h-5 mr-2 text-gray-600"
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
            <h2 className="text-lg font-medium text-gray-800">
              {selectedDate ? formatDate(selectedDate) : (view === 'Month' ? formatMonth() : formatDate(currentDate))}
            </h2>
          </div>

          {selectedDate ? (
            getEventsForDate(selectedDate).length > 0 ? (
              getEventsForDate(selectedDate).map((event) => (
                <div key={event.id} className="bg-gray-50 p-3 rounded-md mb-2 border-l-4 border-blue-500">
                  <p className="text-gray-800 font-medium">{event.travelerName}</p>
                  <p className="text-gray-600 text-sm">
                    {new Date(event.departureDate).toDateString() === selectedDate.toDateString() 
                      ? 'Departure' 
                      : new Date(event.returnDate).toDateString() === selectedDate.toDateString()
                        ? 'Return'
                        : 'Travel'}
                  </p>
                  <p className="text-gray-600 text-sm">Project: {event.projectCode}</p>
                  <p className="text-gray-600 text-sm">ID: {event.id}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-600">No travel requests for this date.</p>
            )
          ) : (
            <p className="text-gray-600">Select a date to view details.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;