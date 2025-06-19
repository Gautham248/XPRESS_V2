import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MonthView from '../MonthView';
import { TravelEvent, DayInfo } from '../Calendar';

// Mock data for testing
const mockDayInfo: DayInfo = {
  day: 15,
  month: 2, // March (0-indexed)
  year: 2024,
  currentMonth: true
};

// Mock travel events - using type assertion to bypass TypeScript date property issues
const mockTravelEvents: TravelEvent[] = [
  {
    type: 'OutboundDeparture',
    date: new Date(Date.UTC(2024, 2, 15)),
    description: 'Flight to Paris'
  },
  {
    type: 'ReturnArrival', 
    date: new Date(Date.UTC(2024, 2, 15)),
    description: 'Return from Paris'
  }
] as TravelEvent[];

const mockGetDaysForMonth = jest.fn((year: number, month: number): DayInfo[] => {
  const days: DayInfo[] = [];
  // Generate a simple month with 31 days for testing
  for (let i = 1; i <= 31; i++) {
    days.push({
      day: i,
      month: month,
      year: year,
      currentMonth: true
    });
  }
  return days;
});

const mockGetEventsForDate = jest.fn((date: Date): TravelEvent[] => {
  // Return events only for March 15, 2024
  const targetDate = new Date(Date.UTC(2024, 2, 15));
  if (date.getTime() === targetDate.getTime()) {
    return mockTravelEvents;
  }
  return [];
});

const mockOnDayCellClick = jest.fn();

const defaultProps = {
  currentDate: new Date(Date.UTC(2024, 2, 15)), // March 15, 2024
  getDaysForMonth: mockGetDaysForMonth,
  getEventsForDate: mockGetEventsForDate,
  selectedDate: null,
  onDayCellClick: mockOnDayCellClick
};

describe('MonthView Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test Case 1: Component renders correctly with weekday headers
  test('renders weekday headers correctly', () => {
    render(<MonthView {...defaultProps} />);
    
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    weekdays.forEach(day => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  // Test Case 2: Component renders month days and calls getDaysForMonth
  test('renders month days and calls getDaysForMonth with correct parameters', () => {
    render(<MonthView {...defaultProps} />);
    
    // Verify getDaysForMonth was called with correct year and month
    expect(mockGetDaysForMonth).toHaveBeenCalledWith(2024, 2);
    
    
    const dayElements = screen.getAllByText('1');
    expect(dayElements.length).toBeGreaterThan(0);
 
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('31')).toBeInTheDocument();
  });

  // Test Case 3: Selected date highlighting works correctly
  test('applies selected date styling correctly', () => {
    const selectedDate = new Date(Date.UTC(2024, 2, 10)); // Use day 10 to avoid conflicts
    render(<MonthView {...defaultProps} selectedDate={selectedDate} />);
    
    // Find the day cell for March 10
    const selectedDayText = screen.getByText('10');
    const selectedDayCell = selectedDayText.closest('div');
    expect(selectedDayCell).toHaveClass('bg-blue-100', 'border-blue-500');
  });

  // Test Case 4: Event counts display correctly
  test('displays event count badges correctly', () => {
    render(<MonthView {...defaultProps} />);
    
    // Verify that getEventsForDate is called for dates
    expect(mockGetEventsForDate).toHaveBeenCalled();
    
    // Find event count badges for March 15 (the day with events)
    const outboundBadge = screen.getByTitle('1 Outbound Departures');
    const returnBadge = screen.getByTitle('1 Return Arrivals');
    
    expect(outboundBadge).toBeInTheDocument();
    expect(returnBadge).toBeInTheDocument();
    expect(outboundBadge).toHaveClass('bg-blue-500');
    expect(returnBadge).toHaveClass('bg-green-500');
  });

  // Test Case 5: Day cell click handler works correctly
  test('calls onDayCellClick when day cell is clicked', () => {
    render(<MonthView {...defaultProps} />);
    
  
    const dayText = screen.getByText('10');
    const dayCell = dayText.closest('div');
    fireEvent.click(dayCell!);

    expect(mockOnDayCellClick).toHaveBeenCalledWith({
      day: 10,
      month: 2,
      year: 2024,
      currentMonth: true
    });
  });
});