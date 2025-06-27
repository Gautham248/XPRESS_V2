import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import axios from 'axios';
import ApprovalTimeline from '../ApprovalTimeline';

// --- Mocks ---
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('lucide-react', () => ({
  Check: () => <div data-testid="icon-check" />,
  Clock: () => <div data-testid="icon-clock" />,
  X: () => <div data-testid="icon-x" />,
  Edit: () => <div data-testid="icon-edit" />,
}));

// --- Test Data Factory ---
const createMockApiResponse = (overrides: any = {}) => {
  const defaultData = {
    isSuccess: true,
    result: {
      status: 'Approved',
      requestDate: '01-07-2023 10:00',
      travelerName: 'John Doe',
      timelineEvents: [
        { id: '1', type: 'PendingReview', date: '01-07-2023 10:00', description: 'Request created', details: null },
        { id: '2', type: 'Approved', date: '01-07-2023 11:00', description: 'Manager approved', details: null },
      ],
      ...overrides,
    },
  };
  return { data: defaultData };
};

// --- Test Suite ---
describe('ApprovalTimeline Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- Initial States and Prop Handling ---
  it('should display a loading state initially', () => {
    render(<ApprovalTimeline requestId="123" />);
    expect(screen.getByText(/Loading timeline.../i)).toBeInTheDocument();
  });

  it('should display an error if requestId is not provided', () => {
    render(<ApprovalTimeline requestId="" />);
    expect(screen.getByText(/Request ID is not provided/i)).toBeInTheDocument();
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  // --- API Call Handling ---
  it('should fetch and display timeline data on successful API call', async () => {
    mockedAxios.get.mockResolvedValue(createMockApiResponse());
    render(<ApprovalTimeline requestId="123" />);
    await waitFor(() => expect(screen.queryByText(/Loading timeline.../i)).not.toBeInTheDocument());
    expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:5030/api/TravelRequest/123/timeline');
    expect(screen.getByText('Request Submitted')).toBeInTheDocument();
  });

  it('should display an error message if the API call fails (network error)', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Network Error'));
    render(<ApprovalTimeline requestId="123" />);
    await waitFor(() => expect(screen.queryByText(/Loading timeline.../i)).not.toBeInTheDocument());
    expect(screen.getByText('Error Loading Timeline')).toBeInTheDocument();
    expect(screen.getByText(/An unexpected error occurred: Network Error/i)).toBeInTheDocument();
  });

  it('should display an error message if the API response indicates failure', async () => {
    mockedAxios.get.mockResolvedValue({ data: { isSuccess: false, errorMessages: ['Invalid ID.'] } });
    render(<ApprovalTimeline requestId="123" />);
    await waitFor(() => expect(screen.queryByText(/Loading timeline.../i)).not.toBeInTheDocument());
    expect(screen.getByText('Invalid ID.')).toBeInTheDocument();
  });

  it('should render a default timeline when API returns no timeline events', async () => {
    mockedAxios.get.mockResolvedValue(createMockApiResponse({ timelineEvents: [] }));
    render(<ApprovalTimeline requestId="123" />);
    await waitFor(() => expect(screen.queryByText(/Loading timeline.../i)).not.toBeInTheDocument());
    expect(screen.queryByText(/No timeline data available/i)).not.toBeInTheDocument();
    expect(screen.getByText('Request Submitted')).toBeInTheDocument();
  });

  // --- Timeline Logic and Rendering Scenarios ---
  it('should correctly render a simple linear progression', async () => {
    mockedAxios.get.mockResolvedValue(createMockApiResponse({
      status: 'OptionsListed',
      timelineEvents: [
        { id: '1', type: 'PendingReview', date: '01-07-2023 10:00' },
        { id: '2', type: 'Approved', date: '01-07-2023 11:00' },
        { id: '3', type: 'OptionsListed', date: '01-07-2023 12:00' },
      ],
    }));

    render(<ApprovalTimeline requestId="123" />);
    await waitFor(() => {
      expect(screen.getByText('Request Submitted')).toHaveClass('text-green-700');
      expect(screen.getByText('Approved')).toHaveClass('text-green-700');
      expect(screen.getByText('Options Provided')).toHaveClass('text-green-700');
      expect(screen.getByText('Option Confirmed')).toHaveClass('text-purple-700');
    });
  });

  it('should correctly render a rejected request', async () => {
    mockedAxios.get.mockResolvedValue(createMockApiResponse({
      status: 'Rejected',
      timelineEvents: [
        { id: '1', type: 'PendingReview', date: '01-07-2023 10:00' },
        { id: '2', type: 'Rejected', date: '01-07-2023 11:00' },
      ],
    }));

    render(<ApprovalTimeline requestId="123" />);
    await waitFor(() => {
      const rejectedStepText = screen.getByText('Rejected');
      expect(rejectedStepText).toHaveClass('text-red-600');
      const rejectedStepContainer = rejectedStepText.closest('div.flex');
      expect(within(rejectedStepContainer as HTMLElement).getByTestId('icon-x')).toBeInTheDocument();
    });
  });

  it('should filter out BUApproved events and adjust status for progression', async () => {
    mockedAxios.get.mockResolvedValue(createMockApiResponse({
      status: 'BUApproved',
      timelineEvents: [
        { id: '1', type: 'PendingReview', date: '01-07-2023 10:00' },
        { id: '2', type: 'DUApproved', date: '01-07-2023 11:00' },
        { id: '3', type: 'BUApproved', date: '01-07-2023 12:00' },
      ],
    }));

    render(<ApprovalTimeline requestId="123" />);
    await waitFor(() => {
      expect(screen.queryByText('BU Approval')).not.toBeInTheDocument();
      expect(screen.getByText('DU Approval')).toHaveClass('text-green-700');
      expect(screen.getByText('Ticket Issued')).toHaveClass('text-gray-400');
    });
  });

  it('should merge duplicate OptionSelected events, keeping only the latest one', async () => {
    mockedAxios.get.mockResolvedValue(createMockApiResponse({
      status: 'DUApproved',
      timelineEvents: [
        { id: '1', type: 'PendingReview', date: '01-07-2023 10:00' },
        { id: '2', type: 'OptionSelected', date: '02-07-2023 10:00', description: 'Selected option A' },
        { id: '3', type: 'OptionSelected', date: '02-07-2023 11:00', description: 'Changed to option B' },
        { id: '4', type: 'DUApproved', date: '03-07-2023 10:00' },
      ],
    }));

    render(<ApprovalTimeline requestId="456" />);
    await waitFor(() => {
      expect(screen.getAllByText('Option Confirmed')).toHaveLength(1);
      expect(screen.getByText('Changed to option B')).toBeInTheDocument();
      expect(screen.queryByText('Selected option A')).not.toBeInTheDocument();
    });
  });
});