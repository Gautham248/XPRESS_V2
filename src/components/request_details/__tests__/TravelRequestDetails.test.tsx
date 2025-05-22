import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TravelRequestDetails from '../TravelRequestDetails';
import { mockTravelRequests } from '../../../data/mockData';

// Mock the child components
jest.mock('../TravelRequestInfo', () => {
  return function MockTravelRequestInfo() {
    return <div data-testid="travel-request-info">Travel Request Info</div>;
  };
});

jest.mock('../ApprovalTimeline', () => {
  return function MockApprovalTimeline() {
    return <div data-testid="approval-timeline">Approval Timeline</div>;
  };
});

jest.mock('../TravelInfo', () => {
  return function MockTravelInfo() {
    return <div data-testid="travel-info">Travel Info</div>;
  };
});

jest.mock('../ticket_options/TicketOptionsComponent', () => {
  return function MockTicketComponent() {
    return <div data-testid="ticket-component">Ticket Options</div>;
  };
});

const renderTravelRequestDetails = (id: string = mockTravelRequests[0].id) => {
  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TravelRequestDetails />}>
          <Route path=":id" element={<TravelRequestDetails />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

describe('TravelRequestDetails Component', () => {
  beforeEach(() => {
    window.history.pushState({}, '', `/${mockTravelRequests[0].id}`);
  });

  it('renders travel request details correctly', () => {
    renderTravelRequestDetails();
    const request = mockTravelRequests[0];

    expect(screen.getByText(`${request.id} - ${request.purpose}`)).toBeInTheDocument();
    expect(screen.getByText(`${request.destination} • ${request.departureDate} to ${request.returnDate}`)).toBeInTheDocument();
  });

  it('renders child components', () => {
    renderTravelRequestDetails();

    expect(screen.getByTestId('travel-request-info')).toBeInTheDocument();
    expect(screen.getByTestId('approval-timeline')).toBeInTheDocument();
    expect(screen.getByTestId('travel-info')).toBeInTheDocument();
    expect(screen.getByTestId('ticket-component')).toBeInTheDocument();
  });

  it('shows approval buttons for pending requests', () => {
    const pendingRequest = mockTravelRequests.find(req => req.status === 'Pending');
    window.history.pushState({}, '', `/${pendingRequest?.id}`);
    renderTravelRequestDetails(pendingRequest?.id);

    expect(screen.getByRole('button', { name: /approve/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reject/i })).toBeInTheDocument();
  });

  it('shows export button for all requests', () => {
    renderTravelRequestDetails();
    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
  });

  it('applies correct status colors', () => {
    const request = mockTravelRequests.find(req => req.status === 'Approved');
    window.history.pushState({}, '', `/${request?.id}`);
    renderTravelRequestDetails(request?.id);

    const statusElement = screen.getByText(request?.status || '');
    expect(statusElement.closest('div')).toHaveClass('bg-success/20', 'text-success');
  });

  it('applies correct priority colors', () => {
    const request = mockTravelRequests.find(req => req.priority === 'High');
    window.history.pushState({}, '', `/${request?.id}`);
    renderTravelRequestDetails(request?.id);

    const priorityElement = screen.getByText('High');
    expect(priorityElement.closest('div')).toHaveClass('bg-error/20', 'text-error');
  });

  it('shows not found message for invalid request id', () => {
    window.history.pushState({}, '', '/invalid-id');
    renderTravelRequestDetails('invalid-id');

    expect(screen.getByText('Travel Request Not Found')).toBeInTheDocument();
    expect(screen.getByText('The travel request you\'re looking for could not be found.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /back to travel requests/i })).toBeInTheDocument();
  });

  it('navigates back on not found button click', () => {
    window.history.pushState({}, '', '/invalid-id');
    renderTravelRequestDetails('invalid-id');

    const backButton = screen.getByRole('button', { name: /back to travel requests/i });
    fireEvent.click(backButton);

    expect(window.location.pathname).toBe('/travel-requests');
  });
});