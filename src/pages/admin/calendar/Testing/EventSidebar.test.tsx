
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import EventSidebar from '../EventSidebar';
import { TravelEvent } from '../Calendar';


jest.mock('lucide-react', () => ({
  ...jest.requireActual('lucide-react'),
  CalendarDays: () => <div data-testid="icon-calendar-days" />,
  Info: () => <div data-testid="icon-info" />,
  PlaneTakeoff: () => <div data-testid="icon-plane-takeoff" />,
  PlaneLanding: () => <div data-testid="icon-plane-landing" />,
  MapPin: () => <div data-testid="icon-map-pin" />,
  Flag: () => <div data-testid="icon-flag" />,
}));


const mockOutboundRequest = {
  requestId: 'OB123',
  employeeName: 'Alice Smith',
  currentStatusName: 'Tickets Dispatched',
  outboundDepartureDate: '2024-10-20T09:00:00.000Z',
  outboundArrivalDate: '2024-10-20T17:00:00.000Z',
  returnDepartureDate: null,
  returnArrivalDate: null,
  sourcePlace: 'New York',
  sourceCountry: 'USA',
  destinationPlace: 'London',
  destinationCountry: 'UK',
};

const mockReturnRequest = {
  requestId: 'RA456',
  employeeName: 'Bob Johnson',
  currentStatusName: 'Returned',
  outboundDepartureDate: '2024-10-10T09:00:00.000Z',
  outboundArrivalDate: '2024-10-10T17:00:00.000Z',
  returnDepartureDate: '2024-10-20T18:00:00.000Z',
  returnArrivalDate: '2024-10-20T23:00:00.000Z',
  sourcePlace: 'London',
  sourceCountry: 'UK',
  destinationPlace: 'New York',
  destinationCountry: 'USA',
};

const mockOutboundEvent: TravelEvent = { type: 'OutboundDeparture', request: mockOutboundRequest };
const mockReturnEvent: TravelEvent = { type: 'ReturnArrival', request: mockReturnRequest };

const mockNavigate = jest.fn();
const mockGetEventsForDate = jest.fn();
const mockOnEventTypeChange = jest.fn();

describe('EventSidebar', () => {

  const selectedDate = new Date('2024-10-20T12:00:00Z');

  beforeEach(() => {
    
    jest.clearAllMocks();
  });

  it('renders a placeholder when no date is selected', () => {
    render(
      <EventSidebar
        selectedDate={null}
        selectedEventType={null}
        getEventsForDate={mockGetEventsForDate}
        navigate={mockNavigate}
      />
    );
    expect(screen.getByText('Select a date')).toBeInTheDocument();
    expect(screen.getByText('Click on a day in the calendar to see travel events.')).toBeInTheDocument();
    expect(screen.getByTestId('icon-calendar-days')).toBeInTheDocument();
   
    expect(mockGetEventsForDate).not.toHaveBeenCalled();
  });

  it('renders a message when a date is selected but has no events', () => {
    mockGetEventsForDate.mockReturnValue([]);
    render(
      <EventSidebar
        selectedDate={selectedDate}
        selectedEventType={null}
        getEventsForDate={mockGetEventsForDate}
        navigate={mockNavigate}
      />
    );

    expect(mockGetEventsForDate).toHaveBeenCalledWith(selectedDate);
    expect(screen.getByText('No events scheduled for this date.')).toBeInTheDocument();
    expect(screen.getByTestId('icon-info')).toBeInTheDocument();
  });

  describe('with events on the selected date', () => {
    beforeEach(() => {
    
      mockGetEventsForDate.mockReturnValue([mockOutboundEvent, mockReturnEvent]);
    });

    it('displays all events when no event type is selected', () => {
      render(
        <EventSidebar
          selectedDate={selectedDate}
          selectedEventType={null}
          getEventsForDate={mockGetEventsForDate}
          navigate={mockNavigate}
        />
      );

  
      expect(screen.getByText('All Events for Selected Date')).toBeInTheDocument();
      
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    it('filters to show only outbound departures when selected', () => {
      render(
        <EventSidebar
          selectedDate={selectedDate}
          selectedEventType="OutboundDeparture"
          getEventsForDate={mockGetEventsForDate}
          navigate={mockNavigate}
        />
      );

      expect(screen.getByText('Outbound Departures')).toBeInTheDocument();
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
    });

    it('filters to show only return arrivals when selected', () => {
      render(
        <EventSidebar
          selectedDate={selectedDate}
          selectedEventType="ReturnArrival"
          getEventsForDate={mockGetEventsForDate}
          navigate={mockNavigate}
        />
      );

      expect(screen.getByText('Return Arrivals')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
      expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument();
    });

    it('navigates to the correct request page on click', async () => {
      const user = userEvent.setup();
      render(
        <EventSidebar
          selectedDate={selectedDate}
          selectedEventType={null}
          getEventsForDate={mockGetEventsForDate}
          navigate={mockNavigate}
        />
      );

      const aliceCard = screen.getByText('Alice Smith').closest('li');
      expect(aliceCard).toBeInTheDocument();
      
      await user.click(aliceCard!);

      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith(`/admin/travel-requests/${mockOutboundRequest.requestId}`);
    });
    
    it('displays and handles filter buttons correctly', async () => {
      const user = userEvent.setup();
      render(
        <EventSidebar
          selectedDate={selectedDate}
          selectedEventType="OutboundDeparture" // Start with one selected
          getEventsForDate={mockGetEventsForDate}
          navigate={mockNavigate}
          onEventTypeChange={mockOnEventTypeChange}
        />
      );
      
      const outboundButton = screen.getByRole('button', { name: 'Outbound Departures' });
      const returnButton = screen.getByRole('button', { name: 'Return Arrivals' });

      expect(outboundButton).toBeInTheDocument();
      expect(returnButton).toBeInTheDocument();

      await user.click(returnButton);
      expect(mockOnEventTypeChange).toHaveBeenCalledTimes(1);
      expect(mockOnEventTypeChange).toHaveBeenCalledWith('ReturnArrival');

      await user.click(outboundButton);
      expect(mockOnEventTypeChange).toHaveBeenCalledTimes(2);
      expect(mockOnEventTypeChange).toHaveBeenCalledWith('OutboundDeparture');
    });

    it('does not display filter buttons if only one type of event exists', () => {
      
      mockGetEventsForDate.mockReturnValue([mockOutboundEvent]);
      render(
        <EventSidebar
          selectedDate={selectedDate}
          selectedEventType={null}
          getEventsForDate={mockGetEventsForDate}
          navigate={mockNavigate}
          onEventTypeChange={mockOnEventTypeChange}
        />
      );

      expect(screen.queryByRole('button', { name: 'Outbound Departures' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Return Arrivals' })).not.toBeInTheDocument();
    });
  });
});