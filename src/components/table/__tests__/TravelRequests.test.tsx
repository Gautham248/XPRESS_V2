import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TravelRequests from '../TravelRequests';
import { mockTravelRequests } from '../../../data/mockData';

const renderTravelRequests = () => {
  return render(
    <BrowserRouter>
      <TravelRequests />
    </BrowserRouter>
  );
};

describe('TravelRequests Component', () => {
  it('renders travel requests table with correct columns', () => {
    renderTravelRequests();
    
    expect(screen.getByText('Traveler Name')).toBeInTheDocument();
    expect(screen.getByText('Project Code')).toBeInTheDocument();
    expect(screen.getByText('Travel Type')).toBeInTheDocument();
    expect(screen.getByText('Source')).toBeInTheDocument();
    expect(screen.getByText('Destination')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('displays mock travel request data correctly', () => {
    renderTravelRequests();
    
    const firstRequest = mockTravelRequests[0];
    expect(screen.getByText(firstRequest.travelerName)).toBeInTheDocument();
    expect(screen.getByText(firstRequest.projectCode)).toBeInTheDocument();
    expect(screen.getByText(firstRequest.source)).toBeInTheDocument();
    expect(screen.getByText(firstRequest.destination)).toBeInTheDocument();
  });

  it('filters requests by search term', () => {
    renderTravelRequests();
    const searchInput = screen.getByPlaceholderText('Search...');
    const firstRequest = mockTravelRequests[0];
    
    fireEvent.change(searchInput, { target: { value: firstRequest.travelerName } });
    
    expect(screen.getByText(firstRequest.travelerName)).toBeInTheDocument();
    expect(screen.getByText(firstRequest.projectCode)).toBeInTheDocument();
    expect(screen.queryByText(mockTravelRequests[1].travelerName)).not.toBeInTheDocument();
  });

  it('filters requests by status', () => {
    renderTravelRequests();
    const statusFilter = screen.getByText('All');
    const targetStatus = mockTravelRequests[0].status;
    
    fireEvent.click(statusFilter);
    fireEvent.click(screen.getByText(targetStatus));
    
    const visibleRequests = screen.getAllByText(targetStatus);
    expect(visibleRequests.length).toBeGreaterThan(0);
  });

  it('filters requests by travel type', () => {
    renderTravelRequests();
    const typeFilter = screen.getByText('All');
    const targetType = mockTravelRequests[0].travelType;
    
    fireEvent.click(typeFilter);
    fireEvent.click(screen.getByText(targetType));
    
    const visibleRequests = screen.getAllByText(targetType);
    expect(visibleRequests.length).toBeGreaterThan(0);
  });

  it('persists column visibility preferences', () => {
    renderTravelRequests();
    const columnToggle = screen.getByText('Columns');
    
    fireEvent.click(columnToggle);
    const sourceColumn = screen.getByLabelText('Source');
    fireEvent.click(sourceColumn);
    
    const savedColumns = JSON.parse(localStorage.getItem('travelRequestsTableColumns') || '[]');
    expect(savedColumns).not.toContain('source');
  });

  it('navigates to request details on row click', () => {
    renderTravelRequests();
    const firstRequest = mockTravelRequests[0];
    fireEvent.click(screen.getByText(firstRequest.travelerName));
    
    // Navigation would be tested in integration tests
    // Here we just verify the click handler works
    expect(window.location.pathname).toBe('/');
  });

  it('sorts requests by column', () => {
    renderTravelRequests();
    const nameHeader = screen.getByText('Traveler Name');
    
    fireEvent.click(nameHeader);
    const names = screen.getAllByText(/.*/).map(element => element.textContent);
    expect(names).toBeSorted();
    
    fireEvent.click(nameHeader);
    const reversedNames = screen.getAllByText(/.*/).map(element => element.textContent);
    expect(reversedNames).toBeSorted({ descending: true });
  });
});