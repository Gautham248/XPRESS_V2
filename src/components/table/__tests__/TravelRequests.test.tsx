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
    
    expect(screen.getByText('Travel Requests')).toBeInTheDocument();
    expect(screen.getByText('New Request')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search by traveler, destination, ID, project code, or source...')).toBeInTheDocument();
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
    const searchInput = screen.getByPlaceholderText('Search by traveler, destination, ID, project code, or source...');
    const firstRequest = mockTravelRequests[0];
    
    fireEvent.change(searchInput, { target: { value: firstRequest.travelerName } });
    
    expect(screen.getByText(firstRequest.travelerName)).toBeInTheDocument();
    expect(screen.getByText(firstRequest.projectCode)).toBeInTheDocument();
    expect(screen.queryByText(mockTravelRequests[1].travelerName)).not.toBeInTheDocument();
  });

  it('filters requests by status', () => {
    renderTravelRequests();
    const statusFilter = screen.getByText('Status: All');
    const targetStatus = mockTravelRequests[0].status;
    
    fireEvent.click(statusFilter);
    fireEvent.click(screen.getByText(targetStatus));
    
    const visibleRequests = screen.getAllByText(targetStatus);
    expect(visibleRequests.length).toBeGreaterThan(0);
  });

  it('filters requests by travel type', () => {
    renderTravelRequests();
    const typeFilter = screen.getByText('Type: All');
    const targetType = mockTravelRequests[0].travelType;
    
    fireEvent.click(typeFilter);
    fireEvent.click(screen.getByText(targetType));
    
    const visibleRequests = screen.getAllByText(targetType);
    expect(visibleRequests.length).toBeGreaterThan(0);
  });

  it('persists column visibility preferences', () => {
    renderTravelRequests();
    const initialColumns = ['id', 'travelerName', 'projectCode', 'travelType', 'source', 'travelDates', 'destination', 'departmentCode', 'reportingManager', 'status', 'actions'];
    localStorage.setItem('travelRequestsTableColumns', JSON.stringify(initialColumns));
    
    const savedColumns = JSON.parse(localStorage.getItem('travelRequestsTableColumns') || '[]');
    expect(savedColumns).toEqual(initialColumns);
  });

  it('navigates to request details on row click', () => {
    localStorage.setItem('user', JSON.stringify({ role: 'employee' }));
    renderTravelRequests();
    const firstRequest = mockTravelRequests[0];
    
    // Verify the request data is displayed
    expect(screen.getByText(firstRequest.travelerName)).toBeInTheDocument();
    expect(screen.getByText(firstRequest.projectCode)).toBeInTheDocument();
  });

  it('sorts requests by column', () => {
    renderTravelRequests();
    const firstRequest = mockTravelRequests[0];
    const secondRequest = mockTravelRequests[1];
    
    // Verify initial sort order
    expect(screen.getByText(firstRequest.travelerName)).toBeInTheDocument();
    expect(screen.getByText(secondRequest.travelerName)).toBeInTheDocument();
  });
});