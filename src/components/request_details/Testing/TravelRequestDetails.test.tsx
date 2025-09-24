// src/components.request_details/TravelRequestDetails.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import TravelRequestDetails, { ComponentTravelRequest } from '../TravelRequestDetails';

// --- Mocks ---
jest.mock('axios');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));
jest.mock('file-saver', () => ({
  saveAs: jest.fn(),
}));
jest.mock('jszip');
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    success: jest.fn(),
  },
  Toaster: () => <div data-testid="toaster" />,
}));

// Mock child components to isolate TravelRequestDetails
jest.mock('../ApprovalTimeline', () => () => <div data-testid="approval-timeline-mock" />);
jest.mock('../TravelInfo', () => () => <div data-testid="travel-info-mock" />);
jest.mock('../ticket_options/TicketOptionsComponent', () => ({ onPreviewTicket }: { onPreviewTicket: (url: string) => void }) => (
    <div data-testid="ticket-component-mock">
        <button onClick={() => onPreviewTicket('http://localhost/mock-ticket.pdf')}>Preview Ticket From Child</button>
    </div>
));
jest.mock('../TravelInfoBanner', () => () => <div data-testid="travel-info-banner-mock" />);
// We let the actual ConfirmationModal and TicketPreviewModal render to test their integration

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedUseParams = require('react-router-dom').useParams;
const mockedUseNavigate = require('react-router-dom').useNavigate;
const mockedSaveAs = saveAs as unknown as jest.Mock;
const mockedJSZip = JSZip as jest.Mocked<typeof JSZip>;

// --- Test Data ---
const baseTravelRequest: ComponentTravelRequest = {
  id: 'TR-123',
  userId: 5,
  employeeName: 'John Doe',
  outboundDepartureDate: '2023-10-26T10:00:00Z',
  returnDepartureDate: '2023-10-30T18:00:00Z',
  purpose: 'Client Meeting in London',
  submissionDate: '2023-10-20T09:00:00Z',
  destination: 'London',
  isRoundTrip: true,
  ticketDocumentPath: 'http://localhost/path/to/ticket.pdf',
  currentStatusId: 1,
  status: 'PendingReview',
};

const createMockApiResponse = (overrides: Partial<ComponentTravelRequest> = {}) => ({
  isSuccess: true,
  result: {
    ...baseTravelRequest,
    ...overrides,
    requestId: overrides.id || baseTravelRequest.id, 
    purposeOfTravel: overrides.purpose || baseTravelRequest.purpose,
  },
});

const mockUserDocumentsResponse = [
  { id: 'doc1', documentPath: 'http://localhost/path/to/passport.pdf', idType: 'Passport', passportNumber: 'P123' },
  { id: 'doc2', documentPath: 'http://localhost/path/to/visa.jpg', idType: 'Visa', visaNumber: 'V456' },
];

describe('TravelRequestDetails Component', () => {
  let navigateMock: jest.Mock;
  let fetchMock: jest.Mock;

  const setupLocalStorage = (role: 'employee' | 'manager' | 'admin', userId: number) => {
    localStorage.setItem('user', JSON.stringify({ role, userId: userId.toString() }));
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseParams.mockReturnValue({ id: 'TR-123' });
    navigateMock = jest.fn();
    mockedUseNavigate.mockReturnValue(navigateMock);
    localStorage.clear();

    // Mock global fetch
    fetchMock = jest.fn();
    global.fetch = fetchMock;

    // Mock JSZip implementation
    const zipInstance = {
      file: jest.fn().mockReturnThis(),
      generateAsync: jest.fn().mockResolvedValue('zip_blob_content'),
    };
    (mockedJSZip as unknown as jest.Mock).mockImplementation(() => zipInstance);
  });

  // --- Test Cases ---

//   test('displays loading, then data on success, and handles fetch errors', async () => {
//     fetchMock.mockResolvedValueOnce({
//       ok: true,
//       json: async () => createMockApiResponse({ status: 'Approved', currentStatusId: 2 }),
//     });

//     const { rerender } = render(<TravelRequestDetails />);

//     // 1. Initial loading state
//     expect(screen.getByRole('status')).toBeInTheDocument(); // Lucide Loader2 has role="status"

//     // 2. Successful data rendering
//     await waitFor(() => {
//       expect(screen.getByText('TR-123')).toBeInTheDocument();
//     });
//     expect(screen.getByText('Approved')).toBeInTheDocument();
//     expect(screen.getByTestId('travel-info-mock')).toBeInTheDocument();

//     // 3. API error state
//     fetchMock.mockRejectedValueOnce(new Error('API is down'));
//     rerender(<TravelRequestDetails />);
    
//     await waitFor(() => {
//       expect(screen.getByText(/Error: API is down/i)).toBeInTheDocument();
//     });
//   });

  test('manager can approve a request via modal', async () => {
    setupLocalStorage('manager', 101);
    fetchMock.mockResolvedValue({ // Mocks both initial load and approval PUT
      ok: true,
      json: async () => createMockApiResponse({ status: 'PendingReview', currentStatusId: 1 }),
    });

    render(<TravelRequestDetails />);
    
    const approveButton = await screen.findByRole('button', { name: /Approve/i });
    fireEvent.click(approveButton);

    const modalTitle = await screen.findByText('Approve Travel Request');
    expect(modalTitle).toBeInTheDocument();

    const commentsInput = screen.getByPlaceholderText(/Approval comments/i);
    fireEvent.change(commentsInput, { target: { value: 'All good. Proceed.' } });

    const confirmButton = screen.getByRole('button', { name: /Confirm Approval/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        `https://xpress-backend-v3.onrender.com/api/Approvals/TR-123/manager/approve`,
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ approvingUserId: 101, comments: 'All good. Proceed.' }),
        })
      );
    });

    // Modal should close after submission
    expect(screen.queryByText('Approve Travel Request')).not.toBeInTheDocument();
  });

  test('employee can cancel a request with a required reason', async () => {
    setupLocalStorage('employee', 5); // The user ID matches the request
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => createMockApiResponse({ status: 'Approved', currentStatusId: 2 }),
    });
    mockedAxios.put.mockResolvedValue({ data: { isSuccess: true } });

    render(<TravelRequestDetails />);

    const cancelButton = await screen.findByRole('button', { name: /Cancel Request/i });
    fireEvent.click(cancelButton);

    const modalTitle = await screen.findByText('Cancel Travel Request');
    expect(modalTitle).toBeInTheDocument();

    const confirmButton = screen.getByRole('button', { name: /Confirm Cancellation/i });
    
    // Try to submit without a reason
    fireEvent.click(confirmButton);
    expect(require('react-hot-toast').default.error).toHaveBeenCalledWith("A reason for cancellation is required.");
    expect(mockedAxios.put).not.toHaveBeenCalled();

    // Now, provide a reason and submit
    const reasonInput = screen.getByPlaceholderText(/Reason for cancellation/i);
    fireEvent.change(reasonInput, { target: { value: 'Trip postponed.' } });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith(
        `https://xpress-backend-v3.onrender.com/api/TravelRequest/TR-123/updatestatus`,
        { requestId: 'TR-123', newStatusId: 11, userId: 5, comments: 'Trip postponed.', actionType: 'CancelRequest' }
      );
    });
  });

//   test('handles document download flow correctly', async () => {
//     setupLocalStorage('admin', 1);
//     // 1. Initial request fetch
//     fetchMock.mockResolvedValueOnce({
//       ok: true,
//       json: async () => createMockApiResponse({ userId: 5, employeeName: 'John_Doe' }),
//     });
    
//     render(<TravelRequestDetails />);

//     const downloadButton = await screen.findByRole('button', { name: /Travel Docs/i });
    
//     // 2. Mock fetch for user documents when download button is clicked
//     fetchMock.mockResolvedValueOnce({
//       ok: true,
//       json: async () => mockUserDocumentsResponse,
//     });
//     // 3. Mock fetches for each document blob
//     fetchMock.mockImplementation((url: string) => Promise.resolve({
//         ok: true,
//         blob: () => Promise.resolve(new Blob([`content_for_${url}`])),
//     }));

//     fireEvent.click(downloadButton);

//     await waitFor(() => {
//       expect(screen.getByText('Download Documents')).toBeInTheDocument();
//     });

//     // Check if ticket and user docs are in the modal
//     expect(screen.getByLabelText(/TravelTicket-TR-123.pdf/i)).toBeChecked();
//     expect(screen.getByLabelText(/Passport-P123.pdf/i)).toBeChecked();
//     expect(screen.getByLabelText(/Visa-V456.jpg/i)).toBeChecked();
    
//     // Uncheck one document to test selection change
//     fireEvent.click(screen.getByLabelText(/Visa-V456.jpg/i));
//     expect(screen.getByLabelText(/Visa-V456.jpg/i)).not.toBeChecked();

//     const downloadConfirmButton = screen.getByRole('button', { name: /Download \(2\)/i });
//     fireEvent.click(downloadConfirmButton);

//     await waitFor(() => {
//       const zipInstance = (mockedJSZip as any).mock.results[0].value;
//       expect(zipInstance.file).toHaveBeenCalledTimes(2);
//       expect(zipInstance.file).toHaveBeenCalledWith('TravelTicket-TR-123.pdf', expect.any(Blob));
//       expect(zipInstance.file).toHaveBeenCalledWith('Passport-P123.pdf', expect.any(Blob));
//       expect(zipInstance.generateAsync).toHaveBeenCalledWith({ type: 'blob' });
//       expect(mockedSaveAs).toHaveBeenCalledWith('zip_blob_content', 'John_Doe-TravelDocs-TR-123.zip');
//     });
//   });

//   test('opens and closes the ticket preview modal on child component event', async () => {
//     fetchMock.mockResolvedValue({
//       ok: true,
//       json: async () => createMockApiResponse(),
//     });

//     render(<TravelRequestDetails />);

//     const childPreviewButton = await screen.findByRole('button', { name: /Preview Ticket From Child/i });
//     fireEvent.click(childPreviewButton);

//     const modal = await screen.findByTestId('ticket-preview-modal');
//     expect(modal).toBeInTheDocument();
//     expect(screen.getByText('Ticket Preview')).toBeInTheDocument();
    
//     // Check if the correct URL from the component's state is passed down
//     expect(screen.getByText(/mock-ticket.pdf/)).toBeInTheDocument();

//     const closeButton = screen.getByRole('button', { name: /Close/i });
//     fireEvent.click(closeButton);

//     await waitFor(() => {
//       expect(screen.queryByTestId('ticket-preview-modal')).not.toBeInTheDocument();
//     });
//   });
});