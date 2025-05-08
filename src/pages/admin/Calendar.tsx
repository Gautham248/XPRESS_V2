import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Filter,
  ChevronDown,
  User,
  MapPin
} from 'lucide-react';
import { mockTravelRequests } from '../../data/mockData';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, parseISO } from 'date-fns';

const Calendar: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  
  const onDateClick = (day: Date) => {
    setSelectedDate(day);
  };

  const prevMonth = () => {
    setCurrentMonth(addMonths(currentMonth, -1));
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  const getTravelRequestsForDate = (date: Date) => {
    return mockTravelRequests.filter(request => {
      const departureDate = parseISO(request.departureDate);
      const returnDate = parseISO(request.returnDate);
      
      // Check if the given date falls within the travel period
      return (date >= departureDate && date <= returnDate);
    });
  };
  
  const renderHeader = () => {
    const dateFormat = "MMMM yyyy";
    
    return (
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <h3 className="text-lg font-semibold">
            <CalendarIcon className="h-5 w-5 inline-block mr-2" />
            {format(currentMonth, dateFormat)}
          </h3>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            <button
              className="p-1 rounded-md text-muted-foreground hover:bg-muted transition-colors"
              onClick={prevMonth}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              className="p-1 rounded-md text-muted-foreground hover:bg-muted transition-colors"
              onClick={nextMonth}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex bg-muted rounded-md overflow-hidden">
            <button
              className={`px-3 py-1 text-sm ${view === 'month' ? 'bg-card' : ''}`}
              onClick={() => setView('month')}
            >
              Month
            </button>
            <button
              className={`px-3 py-1 text-sm ${view === 'week' ? 'bg-card' : ''}`}
              onClick={() => setView('week')}
            >
              Week
            </button>
          </div>
          
          <div className="relative">
            <button className="flex items-center justify-between px-3 py-2 bg-muted rounded-md min-w-28">
              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">All Travelers</span>
              </div>
              <ChevronDown className="h-4 w-4 ml-2 text-muted-foreground" />
            </button>
            <div className="absolute z-10 right-0 mt-1 w-48 bg-card border rounded-md shadow-elevation-3 hidden">
              <div className="py-1">
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-muted/50">
                  All Travelers
                </button>
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-muted/50">
                  John Smith
                </button>
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-muted/50">
                  Emily Johnson
                </button>
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-muted/50">
                  Robert Chen
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const dateFormat = "EEE";
    const days = [];
    
    let startDate = startOfWeek(currentMonth);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="text-center py-2 text-sm font-medium text-muted-foreground" key={i}>
          {format(addDays(startDate, i), dateFormat)}
        </div>
      );
    }

    return <div className="grid grid-cols-7">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const rows = [];

    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const cloneDay = day;
        const travelRequests = getTravelRequestsForDate(day);
        
        days.push(
          <div
            className={`min-h-24 border border-dashed p-1 ${
              !isSameMonth(day, monthStart)
                ? "bg-muted/50 text-muted-foreground"
                : isSameDay(day, selectedDate) 
                  ? "bg-primary/10"
                  : ""
            }`}
            key={day.toString()}
            onClick={() => onDateClick(cloneDay)}
          >
            <div className="p-1">
              <span className={`text-sm font-medium ${
                isSameDay(day, new Date()) ? "bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center" : ""
              }`}>
                {formattedDate}
              </span>
            </div>
            <div className="overflow-y-auto max-h-20">
              {travelRequests.map((request, idx) => (
                <div 
                  key={idx}
                  className={`text-xs p-1 mb-1 rounded truncate ${
                    request.travelType === 'Domestic' 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-secondary/10 text-secondary'
                  }`}
                >
                  {request.travelerName.split(' ')[0]}
                </div>
              ))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }

    return <div className="overflow-hidden">{rows}</div>;
  };
  
  const renderSelectedDateEvents = () => {
    const travelRequests = getTravelRequestsForDate(selectedDate);
    
    if (travelRequests.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No travel requests for this date.</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4 mt-4">
        {travelRequests.map((request, idx) => (
          <div key={idx} className="border rounded-md p-3 hover:bg-muted/50 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span 
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mb-1 ${
                    request.travelType === 'Domestic' 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-secondary/10 text-secondary'
                  }`}
                >
                  {request.travelType}
                </span>
                <h4 className="font-medium">{request.purpose}</h4>
              </div>
              <span 
                className={`inline-flex items-center px-2 5 py-0.5 rounded-full text-xs font-medium ${
                  request.status === 'Approved' 
                    ? 'bg-success/20 text-success' 
                    : request.status === 'Pending' 
                      ? 'bg-warning/20 text-warning' 
                      : request.status === 'Rejected'
                        ? 'bg-error/20 text-error'
                        : 'bg-muted text-muted-foreground'
                }`}
              >
                {request.status}
              </span>
            </div>
            <div className="flex items-center text-sm mb-1">
              <User className="h-3 w-3 mr-1 text-muted-foreground" />
              <span>{request.travelerName}</span>
            </div>
            <div className="flex items-center text-sm">
              <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
              <span>{request.destination}</span>
            </div>
            <div className="mt-2 flex justify-end">
              <button className="text-sm text-primary hover:text-primary-light font-medium">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-semibold">Travel Calendar</h2>
        <button className="btn-primary flex items-center">
          <CalendarIcon className="h-4 w-4 mr-2" />
          New Request
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            {renderHeader()}
            {renderDays()}
            {renderCells()}
          </div>
        </div>
        
        <div>
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              {format(selectedDate, "MMMM d, yyyy")}
            </h3>
            
            {renderSelectedDateEvents()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;