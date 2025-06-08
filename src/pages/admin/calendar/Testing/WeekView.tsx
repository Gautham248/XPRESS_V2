import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import WeekView from '../WeekView';
import { TravelEvent, DayInfo } from '../Calendar';


jest.mock('./EventCard', () => {
  return function MockEventCard({ type, count, onClick }: any) {
    return (
      <div 
        data-testid={`event-card-${type}`}
        onClick={onClick}
        className="mock-event-card"
      >
        {type}: {count}
      </div>
    );
  };
});

describe('WeekView Component', () => {
  const mockGetEventsForDate = jest.fn();
  const mockOnDayCellClick = jest.fn();
  
  const defaultProps = {
    currentDate: new Date('2024-01-15T00:00:00.000Z'), 
    getEventsForDate: mockGetEventsForDate,
    selectedDate: null,
    onDayCellClick: mockOnDayCellClick,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetEventsForDate.mockReturnValue([]);
  });

  // Test Case 1: Renders week view with correct 7 days
  test('renders week view with 7 days starting from Sunday', () => {
    render(<WeekView {...defaultProps} />);
    
    
    const dayHeaders = screen.getAllByText(/^(Sun|Mon|Tue|Wed|Thu|Fri|Sat)$/);
    expect(dayHeaders).toHaveLength(7);
    
    
    expect(screen.getByText('14')).toBeInTheDocument(); 
    expect(screen.getByText('15')).toBeInTheDocument(); 
    expect(screen.getByText('20')).toBeInTheDocument(); 
  });

  // Test Case 2: Displays events correctly for different days
  test('displays travel events correctly for specific days', () => {
    const mockEvents: TravelEvent[] = [
      {
        type: 'OutboundDeparture',
        request: { destination: 'Paris' } as any
      },
      {
        type: 'ReturnArrival',
        request: { destination: 'London' } as any
      }
    ];

    mockGetEventsForDate.mockImplementation((date: Date) => {
      
      if (date.getUTCDate() === 16) {
        return mockEvents;
      }
      return [];
    });

    render(<WeekView {...defaultProps} />);
    

    expect(screen.getByTestId('event-card-OutboundDeparture')).toBeInTheDocument();
    expect(screen.getByTestId('event-card-ReturnArrival')).toBeInTheDocument();
    expect(screen.getByText('OutboundDeparture: 1')).toBeInTheDocument();
    expect(screen.getByText('ReturnArrival: 1')).toBeInTheDocument();
    

    const noEventsTexts = screen.getAllByText('No events');
    expect(noEventsTexts.length).toBeGreaterThan(0);
  });

  // Test Case 3: Handles day cell clicks correctly
  test('calls onDayCellClick when day is clicked', () => {
    render(<WeekView {...defaultProps} />);
    
  
    const dayElement = screen.getByText('16');
    fireEvent.click(dayElement);
    
    expect(mockOnDayCellClick).toHaveBeenCalledWith({
      day: 16,
      currentMonth: true,
      month: 0, 
      year: 2024,
    });
  });

  // Test Case 4: Applies correct styling for selected date
  test('applies correct styling for selected date', () => {
    const selectedDate = new Date('2024-01-17T00:00:00.000Z'); // Wednesday
    
    render(<WeekView {...defaultProps} selectedDate={selectedDate} />);
    

    const selectedDayContainer = screen.getByText('17').closest('div[class*="bg-blue-100"]');
    expect(selectedDayContainer).toBeInTheDocument();
    expect(selectedDayContainer).toHaveClass('bg-blue-100');
  });

  // Test Case 5: Handles today's date styling correctly
  test('applies correct styling for today\'s date', () => {

    const originalDate = Date;
    const mockDate = jest.fn(() => new Date('2024-01-16T12:00:00.000Z'));
    mockDate.UTC = originalDate.UTC;
    global.Date = mockDate as any;

    render(<WeekView {...defaultProps} />);
    
  
    const todayContainer = screen.getByText('16').closest('div[class*="bg-blue-50"]');
    expect(todayContainer).toBeInTheDocument();
    expect(todayContainer).toHaveClass('bg-blue-50');
    
    // Restore original Date
    global.Date = originalDate;
  });

 // Test Case: Handles multiple events of same type
  test('handles multiple events of the same type correctly', () => {
    const multipleEvents: TravelEvent[] = [
      {
        type: 'OutboundDeparture',
        request: { destination: 'Paris' } as any
      },
      {
        type: 'OutboundDeparture',
        request: { destination: 'Rome' } as any
      },
      {
        type: 'OutboundDeparture',
        request: { destination: 'Berlin' } as any
      }
    ];

    mockGetEventsForDate.mockImplementation((date: Date) => {
      if (date.getUTCDate() === 18) {
        return multipleEvents;
      }
      return [];
    });

    render(<WeekView {...defaultProps} />);
   
    expect(screen.getByTestId('event-card-OutboundDeparture')).toBeInTheDocument();
    expect(screen.getByText('OutboundDeparture: 3')).toBeInTheDocument();
  });
});