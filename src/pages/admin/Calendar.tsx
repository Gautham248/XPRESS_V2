// import { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { TravelRequest, mockTravelRequests } from '../../data/mockData';

// interface TravelEvent {
//   type: 'Departure' | 'Return' | 'Processing';
//   request: TravelRequest;
// }

// function Calendar() {
//   const navigate = useNavigate();
//   const [currentDate, setCurrentDate] = useState<Date>(() => {
//     const now = new Date();
//     const istOffset = 5.5 * 60 * 60 * 1000;
//     return new Date(now.getTime() + istOffset);
//   });
//   const [view, setView] = useState<'Month' | 'Week'>('Month');
//   const [selectedDate, setSelectedDate] = useState<Date | null>(null);
//   const [selectedEventType, setSelectedEventType] = useState<'Departure' | 'Return' | 'Processing' | null>(null);
//   const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
//   const [pickerDate, setPickerDate] = useState<Date>(() => {
//     const now = new Date();
//     const istOffset = 5.5 * 60 * 60 * 1000;
//     return new Date(now.getTime() + istOffset);
//   });
//   const [pickerView, setPickerView] = useState<'Days' | 'Months'>('Days');
//   // const [expandedDays, setExpandedDays] = useState<number[]>([]);
//   const datePickerRef = useRef<HTMLDivElement | null>(null);

//   const excludedStatuses = ['Tickets Dispatched', 'Rejected', 'In Transit', 'Closed', 'Returned'];
//   const filteredRequests = mockTravelRequests;

//   const getEventsForDate = (date: Date): TravelEvent[] => {
//     const istOffset = 5.5 * 60 * 60 * 1000;
//     const adjustedDate = new Date(date.getTime() + istOffset);

//     const events: TravelEvent[] = [];

//     filteredRequests.forEach((request) => {
//       const depDate = new Date(request.departureDate);
//       const retDate = new Date(request.returnDate);

//       const adjustedDepDate = new Date(depDate.getTime() + istOffset);
//       const adjustedRetDate = new Date(retDate.getTime() + istOffset);

//       const isDeparture =
//         adjustedDepDate.getFullYear() === adjustedDate.getFullYear() &&
//         adjustedDepDate.getMonth() === adjustedDate.getMonth() &&
//         adjustedDepDate.getDate() === adjustedDate.getDate();

//       const isReturn =
//         adjustedRetDate.getFullYear() === adjustedDate.getFullYear() &&
//         adjustedRetDate.getMonth() === adjustedDate.getMonth() &&
//         adjustedRetDate.getDate() === adjustedDate.getDate();

//       const isProcessing = !excludedStatuses.includes(request.status);

//       if (isDeparture && request.status === 'Tickets Dispatched') {
//         events.push({ type: 'Departure', request });
//       }
//       if (isReturn && request.status === 'Tickets Dispatched') {
//         events.push({ type: 'Return', request });
//       }
//       if ((isDeparture || isReturn) && isProcessing) {
//         events.push({ type: 'Processing', request });
//       }
//     });

//     return events;
//   };

//   const getDaysForMonth = (year: number, month: number) => {
//     const daysInMonth = new Date(year, month + 1, 0).getDate();
//     const firstDayOfMonth = new Date(year, month, 1).getDay();
//     const daysInPrevMonth = new Date(year, month, 0).getDate();

//     const prevMonthDays = Array.from({ length: firstDayOfMonth }, (_, i) => ({
//       day: daysInPrevMonth - firstDayOfMonth + i + 1,
//       currentMonth: false,
//       month: month - 1 < 0 ? 11 : month - 1,
//       year: month - 1 < 0 ? year - 1 : year,
//     }));

//     const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => ({
//       day: i + 1,
//       currentMonth: true,
//       month: month,
//       year: year,
//     }));

//     const totalDaysDisplayed = 42;
//     const nextMonthDays = Array.from(
//       { length: totalDaysDisplayed - (prevMonthDays.length + currentMonthDays.length) },
//       (_, i) => ({
//         day: i + 1,
//         currentMonth: false,
//         month: month + 1 > 11 ? 0 : month + 1,
//         year: month + 1 > 11 ? year + 1 : year,
//       })
//     );

//     return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
//   };

//   const monthDays = getDaysForMonth(currentDate.getFullYear(), currentDate.getMonth());

//   const startOfWeek = new Date(currentDate);
//   startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
//   const weekDays = Array.from({ length: 7 }, (_, i) => {
//     const day = new Date(startOfWeek);
//     day.setDate(startOfWeek.getDate() + i);
//     return day;
//   });

//   const pickerMonthDays = getDaysForMonth(pickerDate.getFullYear(), pickerDate.getMonth());

//   const monthsArray = [
//     'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
//     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
//   ];

//   const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

//   const handlePrev = (): void => {
//     if (view === 'Month') {
//       setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
//     } else {
//       setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7));
//     }
//     setSelectedDate(null);
//     setSelectedEventType(null);
//   };

//   const handleNext = (): void => {
//     if (view === 'Month') {
//       setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
//     } else {
//       setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7));
//     }
//     setSelectedDate(null);
//     setSelectedEventType(null);
//   };

//   const handlePickerPrevYear = (): void => {
//     setPickerDate(new Date(pickerDate.getFullYear() - 1, pickerDate.getMonth(), 1));
//   };

//   const handlePickerNextYear = (): void => {
//     setPickerDate(new Date(pickerDate.getFullYear() + 1, pickerDate.getMonth(), 1));
//   };

//   const handlePickerMonthSelect = (month: number): void => {
//     const newDate = new Date(pickerDate.getFullYear(), month, 1);
//     setPickerDate(newDate);
//     if (view === 'Month') {
//       setCurrentDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
//       setShowDatePicker(false);
//     } else {
//       setPickerView('Days');
//     }
//   };

//   const handlePickerDateSelect = (day: number, month: number, year: number): void => {
//     const selected = new Date(year, month, day);
//     const istOffset = 5.5 * 60 * 60 * 1000;
//     const istDate = new Date(selected.getTime() + istOffset);

//     if (view === 'Month') {
//       setCurrentDate(new Date(istDate.getFullYear(), istDate.getMonth(), 1));
//     } else {
//       const dayOfWeek = istDate.getDay();
//       const startOfSelectedWeek = new Date(istDate);
//       startOfSelectedWeek.setDate(istDate.getDate() - dayOfWeek);
//       setCurrentDate(startOfSelectedWeek);
//     }
//     setSelectedDate(null);
//     setSelectedEventType(null);
//     setShowDatePicker(false);
//   };

//   const formatDate = (date: Date): string => {
//     return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
//   };

//   const formatMonth = (date: Date = currentDate): string => {
//     return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
//   };

//   const formatWeekRange = (): string => {
//     const start = weekDays[0];
//     const end = weekDays[6];
//     return `${start.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}, ${end.getFullYear()}`;
//   };

//   const handleDateClick = (day: number, month: number, year: number): void => {
//     const clickedDate = new Date(year, month, day);
//     setSelectedDate(clickedDate);
//     setSelectedEventType(null);
//   };

//   const today = new Date();
//   const istOffset = 5.5 * 60 * 60 * 1000;
//   const todayIST = new Date(today.getTime() + istOffset);

//   const handleViewChange = (newView: 'Month' | 'Week'): void => {
//     if (selectedDate && newView === 'Week') {
//       const dayOfWeek = selectedDate.getDay();
//       const startOfSelectedWeek = new Date(selectedDate);
//       startOfSelectedWeek.setDate(selectedDate.getDate() - dayOfWeek);
//       setCurrentDate(startOfSelectedWeek);
//     }
//     setView(newView);
    
//     setSelectedEventType(null);
//   };

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent): void => {
//       if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
//         setShowDatePicker(false);
//         setPickerView('Days');
//       }
//     };
//     if (showDatePicker) {
//       document.addEventListener('mousedown', handleClickOutside);
//     }
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [showDatePicker]);

//   const renderMonthSelectionGrid = (): JSX.Element => {
//     return (
//       <div className="absolute top-12 left-0 z-10 p-3 bg-white border rounded-md shadow-md w-64">
//         <div className="flex justify-between items-center mb-4">
//           <span className="text-gray-800 font-medium">{pickerDate.getFullYear()}</span>
//           <div className="flex space-x-2">
//             <button
//               className="p-1 text-gray-600 hover:text-gray-800"
//               onClick={handlePickerPrevYear}
//             >
//               {'<'}
//             </button>
//             <button
//               className="p-1 text-gray-600 hover:text-gray-800"
//               onClick={handlePickerNextYear}
//             >
//               {'>'}
//             </button>
//           </div>
//         </div>
//         <div className="grid grid-cols-4 gap-2">
//           {monthsArray.map((month, index) => {
//             const isCurrentMonth =
//               currentDate.getMonth() === index &&
//               currentDate.getFullYear() === pickerDate.getFullYear();
//             return (
//               <div
//                 key={month}
//                 className={`h-10 flex items-center justify-center rounded-md cursor-pointer text-sm ${
//                   isCurrentMonth ? 'bg-blue-500 text-white' : 'bg-gray-50 text-gray-800'
//                 } hover:bg-blue-100 hover:text-blue-800`}
//                 onClick={() => handlePickerMonthSelect(index)}
//               >
//                 <span>{month}</span>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     );
//   };

 

//   const renderDatePickerDaysGrid = (): JSX.Element => {
//     return (
//       <div className="absolute top-12 left-0 z-10 p-3 bg-white border rounded-md shadow-md w-64">
//         <div className="flex justify-between items-center mb-2">
//           <span className="text-gray-800 font-medium">
//             {pickerDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
//           </span>
//           <button
//             className="ml-1 p-1 text-gray-600 hover:text-gray-800"
//             onClick={() => setPickerView('Months')}
//           >
//             <svg
//               className="w-4 h-4"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M5 15l7-7 7 7"
//               />
//             </svg>
//           </button>
//         </div>
//         <div className="grid grid-cols-7 gap-1">
//           {weekdayNames.map((day) => (
//             <div key={day} className="text-center text-gray-600 font-medium text-xs">
//               {day.charAt(0)}
//             </div>
//           ))}
//           {pickerMonthDays.map((dayInfo, idx) => {
//             const isToday =
//               dayInfo.year === todayIST.getFullYear() &&
//               dayInfo.month === todayIST.getMonth() &&
//               dayInfo.day === todayIST.getDate();
//             return (
//               <div
//                 key={`picker-day-${idx}`}
//                 className={`h-6 flex items-center justify-center rounded-md cursor-pointer text-xs
//                   ${dayInfo.currentMonth ? 'bg-white border border-gray-200 shadow-sm font-medium text-gray-900' : 'bg-gray-100 text-gray-400 opacity-50'}
//                   ${isToday ? 'bg-blue-200 text-blue-800' : ''}
//                   hover:bg-gray-200 hover:shadow-sm transition-all duration-200`}
//                 onClick={() => handlePickerDateSelect(dayInfo.day, dayInfo.month, dayInfo.year)}
//               >
//                 <span>{dayInfo.day}</span>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     );
//   };


//   const getEventCounts = (events: TravelEvent[]) => {
//     const counts = {
//       Departure: 0,
//       Return: 0,
//       Processing: 0,
//     };

//     events.forEach((event) => {
//       if (event.type === 'Departure') counts.Departure++;
//       if (event.type === 'Return') counts.Return++;
//       if (event.type === 'Processing') counts.Processing++;
//     });

//     return counts;
//   };

//   const renderEventCards = (day: Date, events: TravelEvent[]) => {
//     const counts = getEventCounts(events);
//     const cards = [];

//     if (counts.Departure > 0) {
//       cards.push(
//         <div
//           key="departure"
//           className={`bg-blue-50 border-l-4 border-blue-500 p-2 rounded-md text-sm cursor-pointer hover:bg-blue-100 transition-colors duration-200`}
//           onClick={() => {
//             setSelectedDate(day);
//             setSelectedEventType('Departure');
//           }}
//         >
//           <div className="text-blue-700 font-medium">Departures</div>
//           <div className="text-gray-600">{counts.Departure}</div>
//         </div>
//       );
//     }

//     if (counts.Return > 0) {
//       cards.push(
//         <div
//           key="return"
//           className={`bg-green-50 border-l-4 border-green-500 p-2 rounded-md text-sm cursor-pointer hover:bg-green-100 transition-colors duration-200`}
//           onClick={() => {
//             setSelectedDate(day);
//             setSelectedEventType('Return');
//           }}
//         >
//           <div className="text-green-700 font-medium">Returns</div>
//           <div className="text-gray-600">{counts.Return}</div>
//         </div>
//       );
//     }

//     if (counts.Processing > 0) {
//       cards.push(
//         <div
//           key="processing"
//           className={`bg-yellow-50 border-l-4 border-yellow-500 p-2 rounded-md text-sm cursor-pointer hover:bg-yellow-100 transition-colors duration-200`}
//           onClick={() => {
//             setSelectedDate(day);
//             setSelectedEventType('Processing');
//           }}
//         >
//           <div className="text-yellow-700 font-medium">Processing</div>
//           <div className="text-gray-600">{counts.Processing}</div>
//         </div>
//       );
//     }

//     return cards.length > 0 ? (
//       <div className="flex flex-col space-y-2">
//         {cards}
//       </div>
//     ) : (
//       <div className="text-gray-500 text-sm text-center py-2">No events</div>
//     );
//   };

//   const handleViewMore = (dayIndex: number): void => {
//     setExpandedDays((prev) => [...prev, dayIndex]);
//   };

//   return (
//     <div className="p-4 bg-gray-100 rounded-lg shadow-md w-full">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-semibold text-gray-800">Travel Calendar</h1>
//       </div>

//       <div className="flex gap-4">
//         <div className="flex-[0.65] bg-white rounded-lg shadow-sm p-4">
//           <div className="flex items-center mb-4">
//             <div className="relative mr-4" ref={datePickerRef}>
//               <button
//                 className="p-2 flex items-center text-gray-600 hover:text-gray-800"
//                 onClick={() => {
//                   if (showDatePicker) {
//                     setShowDatePicker(false);
//                   } else {
//                     setShowDatePicker(true);
//                     setPickerDate(new Date(currentDate));
//                     setPickerView('Months');
//                   }
//                 }}
//               >
//                 <svg
//                   className="w-5 h-5 mr-2"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                   xmlns="http://www.w3.org/2000/svg"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
//                   />
//                 </svg>
//                 <span className="text-lg">{view === 'Month' ? formatMonth() : formatWeekRange()}</span>
//               </button>
//               {showDatePicker && (
//                 pickerView === 'Months' ? renderMonthSelectionGrid() : renderDatePickerDaysGrid()
//               )}
//             </div>

//             <div className="flex items-center">
//               <button
//                 className="px-2 py-1 text-gray-600 hover:text-gray-800"
//                 onClick={handlePrev}
//               >
//                 {'<'}
//               </button>
//               <button
//                 className="px-2 py-1 text-gray-600 hover:text-gray-800"
//                 onClick={handleNext}
//               >
//                 {'>'}
//               </button>
//             </div>

//             <div className="ml-auto">
//               <div className="flex space-x-2">
//                 <button
//                   className={`px-4 py-2 rounded-md ${view === 'Month' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
//                   onClick={() => handleViewChange('Month')}
//                 >
//                   Month
//                 </button>
//                 <button
//                   className={`px-4 py-2 rounded-md ${view === 'Week' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
//                   onClick={() => handleViewChange('Week')}
//                 >
//                   Week
//                 </button>
//               </div>
//             </div>
//           </div>

//           {view === 'Month' ? (
//             <div>
//               <div className="grid grid-cols-7 gap-1">
//                 {weekdayNames.map((day) => (
//                   <div key={day} className="text-center text-gray-600 font-medium">
//                     {day}
//                   </div>
//                 ))}
//                 {monthDays.map((dayInfo, index) => {
//                   const date = new Date(dayInfo.year, dayInfo.month, dayInfo.day);
//                   const events = getEventsForDate(date);
//                   const isSelected =
//                     selectedDate &&
//                     selectedDate.getFullYear() === date.getFullYear() &&
//                     selectedDate.getMonth() === date.getMonth() &&
//                     selectedDate.getDate() === date.getDate();
//                   const isToday =
//                     date.getFullYear() === todayIST.getFullYear() &&
//                     date.getMonth() === todayIST.getMonth() &&
//                     dayInfo.day === todayIST.getDate();

//                   return (
//                     <div
//                       key={`month-day-${index}`}
//                       className={`h-16 flex flex-col p-1 rounded-md cursor-pointer relative
//                         ${dayInfo.currentMonth ? 'bg-white border border-gray-200 shadow-sm' : 'bg-gray-100 opacity-50'}
//                         ${isSelected ? 'bg-blue-100' : ''}
//                         ${isToday ? 'bg-blue-200' : ''}
//                         hover:bg-gray-200 hover:shadow-sm hover:border hover:border-gray-300 transition-all duration-200`}
//                       onClick={() => handleDateClick(dayInfo.day, dayInfo.month, dayInfo.year)}
//                     >
//                       <span className={`text-gray-800 text-center ${!dayInfo.currentMonth ? 'text-gray-400 opacity-50 font-light' : 'font-medium'}`}>
//                         {dayInfo.day}
//                       </span>
//                       {events.length > 0 && (
//                         <div className="absolute bottom-1.5 right-1 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
//                           {events.length}
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           ) : (
//             <div className="h-[384px]">
//               <div className="grid grid-cols-7 gap-2 h-full">
//                 {weekDays.map((day, index) => {
//                   const events = getEventsForDate(day);
//                   const isSelected =
//                     selectedDate &&
//                     selectedDate.getFullYear() === day.getFullYear() &&
//                     selectedDate.getMonth() === day.getMonth() &&
//                     selectedDate.getDate() === day.getDate();
//                   const isToday =
//                     day.getFullYear() === todayIST.getFullYear() &&
//                     day.getMonth() === todayIST.getMonth() &&
//                     day.getDate() === todayIST.getDate();
//                   const isExpanded = expandedDays.includes(index);
//                   const visibleEvents = isExpanded ? events : events.slice(0, 3);
//                   const remainingEvents = events.length - visibleEvents.length;

//                   return (
//                     <div key={index} className="flex flex-col h-full">
//                       <div className="text-center text-gray-600 font-medium">
//                         {day.toLocaleDateString('en-US', { weekday: 'short' })}
//                       </div>
//                       <div
//                         className={`h-10 flex items-center justify-center rounded-md cursor-pointer
//                           ${isSelected ? 'bg-blue-100' : 'bg-gray-50'}
//                           ${isToday ? 'bg-blue-200' : ''}
//                           hover:bg-gray-200 hover:shadow-sm hover:border hover:border-gray-300 transition-all duration-200`}
//                         onClick={() => handleDateClick(day.getDate(), day.getMonth(), day.getFullYear())}
//                       >
//                         <span className="text-gray-800 text-lg">{day.getDate()}</span>
//                         {events.length > 0 && (
//                           <div className="absolute bottom-1 right-1 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
//                             {events.length}
//                           </div>
//                         )}
//                       </div>
//                       <div className="flex-1 mt-2 flex flex-col space-y-1 overflow-auto">
//                         {renderEventCards(day, events)}
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           )}
//         </div>

//         <div className="flex-[0.35] bg-white rounded-lg shadow-sm border border-gray-100 p-4 h-fit">
//           <div className="flex items-center mb-4">
//             <svg
//               className="w-5 h-5 mr-2 text-gray-600"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//               xmlns="http://www.w3.org/2000/svg"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
//               />
//             </svg>
//             <h2 className="text-lg font-medium text-gray-800">
//               {selectedDate ? formatDate(selectedDate) : (view === 'Month' ? formatMonth() : formatDate(currentDate))}
//             </h2>
//           </div>

//           {selectedDate ? (
//             <div className="max-h-[400px] overflow-y-auto space-y-2">
//               {getEventsForDate(selectedDate).length > 0 ? (
//                 getEventsForDate(selectedDate)
//                   .filter((event) => !selectedEventType || event.type === selectedEventType)
//                   .map((event, idx) => (
//                     <div
//                       key={`${idx}`}
//                       className={`bg-gray-50 p-3 rounded-md border-l-4 cursor-pointer
//                         ${event.type === 'Departure' ? 'border-blue-500' : event.type === 'Return' ? 'border-green-500' : 'border-yellow-500'}
//                         hover:bg-gray-100 transition-colors duration-200`}
//                       onClick={() => navigate(`/admin/travel-requests/${event.request.id}`)}
//                     >
//                       <p className="text-gray-800 font-medium">{event.request.travelerName}</p>
//                       <p className="text-gray-600 text-sm">{event.type}</p>
//                       <p className="text-gray-600 text-sm">Project: {event.request.projectCode}</p>
//                       <p className="text-gray-600 text-sm">ID: {event.request.id}</p>
//                     </div>
//                   ))
//               ) : (
//                 <p className="text-gray-600">No travel requests for this date.</p>
//               )}
//             </div>
//           ) : (
//             <p className="text-gray-600">Select a date to view details.</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Calendar;