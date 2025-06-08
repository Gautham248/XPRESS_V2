import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import { MemoryRouter } from 'react-router-dom';
import Calendar, { TravelRequest } from '../Calendar'; // Adjust the path to your Calendar component if needed

// --- Mocks ---
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// --- Test Data ---
const mockTravelRequests: TravelRequest[] = [
  // Event on Oct 25
  {
    requestId: 'req-123',
    employeeName: 'John Doe',
    sourcePlace: 'New York',
    destinationPlace: 'London',
    currentStatusName: 'Approved',
    outboundDepartureDate: '2023-10-25T00:00:00.000Z',
    outboundArrivalDate: '2023-10-25T00:00:00.000Z',
    returnArrivalDate: '2023-11-10T00:00:00.000Z',
    sourceCountry: 'USA',
    destinationCountry: 'UK',
    returnDepartureDate: null,
  },
  // Another event on Oct 25
  {
    requestId: 'req-456',
    employeeName: 'Jane Smith',
    sourcePlace: 'Paris',
    destinationPlace: 'Tokyo',
    currentStatusName: 'Pending',
    outboundDepartureDate: '2023-10-25T00:00:00.000Z',
    outboundArrivalDate: '2023-10-26T00:00:00.000Z',
    returnArrivalDate: '2023-11-16T00:00:00.000Z',
    sourceCountry: 'France',
    destinationCountry: 'Japan',
    returnDepartureDate: null,
  },
];

const mockApiResponse = {
  isSuccess: true,
  result: mockTravelRequests,
  statusCode: 200,
  errorMessages: [],
};

// --- Test Suite ---
describe('Calendar Component', () => {
  // Use fake timers to control the date system-wide
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-10-15T12:00:00Z'));
  });

  afterAll(() => {
    // Restore real timers after all tests in this file
    jest.useRealTimers();
    jest.restoreAllMocks();
  });
  
  beforeEach(() => {
    mockedAxios.get.mockClear();
    mockNavigate.mockClear();
    // Default to a successful response for most tests
    mockedAxios.get.mockResolvedValue({ data: mockApiResponse });
  });

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <Calendar />
      </MemoryRouter>
    );
  
  test('should render loading state initially, then display the calendar with fetched events', async () => {
    renderComponent();
    expect(screen.getByText(/loading travel requests.../i)).toBeInTheDocument();

    // Wait for the main content to appear after loading
    const datePickerButton = await screen.findByRole('button', { name: /October 2023/i });
    expect(datePickerButton).toBeInTheDocument();
    
    // The loading text should be gone
    expect(screen.queryByText(/loading travel requests.../i)).not.toBeInTheDocument();

    // Sidebar should show info for the initially selected date (Oct 15), which has no events.
    // The text comes from EventSidebar.tsx for an empty day.
    expect(screen.getByText(/No events scheduled for this date./i)).toBeInTheDocument();
  });

  test('should display an error message if the API call fails', async () => {
    // Arrange: Mock a rejected promise
    mockedAxios.get.mockRejectedValue(new Error('Network Error'));
    
    renderComponent();

    // Act & Assert: Wait for the fallback error message to appear
    const errorMessage = await screen.findByText(/Failed to load travel requests. Please try again later./i);
    expect(errorMessage).toBeInTheDocument();
    
    // The main calendar content should not be rendered
    expect(screen.queryByRole('button', { name: /October 2023/i })).not.toBeInTheDocument();
  });

  test('should switch between Month and Week view', async () => {
    renderComponent();
    // Wait for the initial month view to be ready
    await screen.findByRole('button', { name: /October 2023/i });

    const weekToggleButton = screen.getByRole('button', { name: /week/i });
    fireEvent.click(weekToggleButton);

    // Wait for the view to update to the week range display
    const weekRangeDisplay = await screen.findByRole('button', { name: /October 15 - 21, 2023/i });
    expect(weekRangeDisplay).toBeInTheDocument();
  });

  test('should fetch data for the next month when "Next" is clicked', async () => {
    renderComponent();
    await screen.findByRole('button', { name: /October 2023/i });
    
    // Clear the initial call to isolate the call we want to test
    mockedAxios.get.mockClear();
    
    const nextButton = screen.getByRole('button', { name: /next period/i });
    fireEvent.click(nextButton);
    
    // Wait for the header to update to November
    const novemberDisplay = await screen.findByRole('button', { name: /November 2023/i });
    expect(novemberDisplay).toBeInTheDocument();
    
    // Verify that a new API call was made for the new view
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });

  test('should use cached data and not re-fetch when returning to a previously viewed month', async () => {
    renderComponent();
    await screen.findByRole('button', { name: /October 2023/i });
    expect(mockedAxios.get).toHaveBeenCalledTimes(1); // Initial load for October
    
    // 1. Go to the next month
    const nextButton = screen.getByRole('button', { name: /next period/i });
    fireEvent.click(nextButton);
    await screen.findByRole('button', { name: /November 2023/i });
    expect(mockedAxios.get).toHaveBeenCalledTimes(2); // Fetched for November
    
    // 2. Go back to the previous month
    const prevButton = screen.getByRole('button', { name: /previous period/i });
    fireEvent.click(prevButton);
    await screen.findByRole('button', { name: /October 2023/i });
    
    // 3. Assert that no NEW API call was made. The total count should remain 2.
    expect(mockedAxios.get).toHaveBeenCalledTimes(2);
  });
});