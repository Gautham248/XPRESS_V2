// src/pages/admin/calendar/EventCard.test.tsx

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import EventCard from '../EventCard'; 
import { TravelRequest } from '../Calendar';


jest.mock('lucide-react', () => ({
  ...jest.requireActual('lucide-react'), 
  PlaneTakeoff: () => <div data-testid="icon-plane-takeoff" />,
  PlaneLanding: () => <div data-testid="icon-plane-landing" />,
}));

describe('EventCard', () => {
  
  const mockRequests: TravelRequest[] = []; 
  const mockOnClick = jest.fn();


  beforeEach(() => {
    mockOnClick.mockClear();
  });

  describe('when type is "OutboundDeparture"', () => {
    it('renders correctly with plural text for count > 1', () => {
      render(
        <EventCard
          type="OutboundDeparture"
          count={5}
          requests={mockRequests}
          onClick={mockOnClick}
        />
      );

      // Check for the main label and count
      expect(screen.getByText('Outbound')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();

      // Check for the correct icon
      expect(screen.getByTestId('icon-plane-takeoff')).toBeInTheDocument();
      expect(screen.queryByTestId('icon-plane-landing')).not.toBeInTheDocument();

      // Check accessibility attributes (aria-label and title)
      const cardElement = screen.getByLabelText('5 Outbound Departures');
      expect(cardElement).toBeInTheDocument();
      expect(cardElement).toHaveAttribute('title', '5 Outbound Departures');
    });

    it('renders correctly with singular text for count = 1', () => {
      render(
        <EventCard
          type="OutboundDeparture"
          count={1}
          requests={mockRequests}
          onClick={mockOnClick}
        />
      );

      // Check accessibility label for correct pluralization
      expect(screen.getByLabelText('1 Outbound Departure')).toBeInTheDocument();
    });

    it('calls onClick with the correct type when clicked', async () => {
      const user = userEvent.setup();
      render(
        <EventCard
          type="OutboundDeparture"
          count={5}
          requests={mockRequests}
          onClick={mockOnClick}
        />
      );

      const cardElement = screen.getByLabelText('5 Outbound Departures');
      await user.click(cardElement);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
      expect(mockOnClick).toHaveBeenCalledWith('OutboundDeparture');
    });
  });

  describe('when type is "ReturnArrival"', () => {
    it('renders correctly with plural text for count > 1', () => {
      render(
        <EventCard
          type="ReturnArrival"
          count={3}
          requests={mockRequests}
          onClick={mockOnClick}
        />
      );

      // Check for the main label and count
      expect(screen.getByText('Return')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();

      // Check for the correct icon
      expect(screen.getByTestId('icon-plane-landing')).toBeInTheDocument();
      expect(screen.queryByTestId('icon-plane-takeoff')).not.toBeInTheDocument();

      // Check accessibility attributes (aria-label and title)
      const cardElement = screen.getByLabelText('3 Return Arrivals');
      expect(cardElement).toBeInTheDocument();
      expect(cardElement).toHaveAttribute('title', '3 Return Arrivals');
    });

    it('renders correctly with singular text for count = 1', () => {
      render(
        <EventCard
          type="ReturnArrival"
          count={1}
          requests={mockRequests}
          onClick={mockOnClick}
        />
      );

      // Check accessibility label for correct pluralization
      expect(screen.getByLabelText('1 Return Arrival')).toBeInTheDocument();
    });

    it('calls onClick with the correct type when clicked', async () => {
      const user = userEvent.setup();
      render(
        <EventCard
          type="ReturnArrival"
          count={3}
          requests={mockRequests}
          onClick={mockOnClick}
        />
      );

      const cardElement = screen.getByLabelText('3 Return Arrivals');
      await user.click(cardElement);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
      expect(mockOnClick).toHaveBeenCalledWith('ReturnArrival');
    });
  });
});