// src/request_details/ticket_options/TicketPreviewModal.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TicketPreviewModal from '../ticket_options/TicketPreviewModal';

describe('TicketPreviewModal Component', () => {
  // --- Test Data & Mocks ---
  const mockOnClose = jest.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    ticketUrl: 'http://localhost/preview/ticket.pdf',
    downloadUrl: 'http://localhost/download/ticket.pdf',
  };

  // Reset mocks before each test to ensure they are clean
  beforeEach(() => {
    mockOnClose.mockClear();
  });

  // --- Test Cases ---

  test('does not render when isOpen is false', () => {
    // Test Case Description: Verifies the modal is hidden when not active.
    // Test Steps: Render the component with isOpen set to false.
    // Test Data: defaultProps with isOpen: false
    // Expected Results: The component should output nothing (null).

    render(<TicketPreviewModal {...defaultProps} isOpen={false} />);

    // `queryBy*` is used because it returns null instead of throwing an error if the element is not found.
    const modalContent = screen.queryByText('Ticket Preview');
    expect(modalContent).not.toBeInTheDocument();
  });

  test('renders correctly with all props when isOpen is true', () => {
    // Test Case Description: Verifies all key elements are displayed correctly when the modal is open.
    // Test Steps: Render the component with isOpen set to true and check for the title, iframe source, and download link.
    // Test Data: defaultProps
    // Expected Results: The title, iframe, and download button should be present with the correct data.

    render(<TicketPreviewModal {...defaultProps} />);

    // Check for the title
    expect(screen.getByText('Ticket Preview')).toBeInTheDocument();

    // Check that the iframe is rendered with the correct source URL
    const iframe = screen.getByTitle('Ticket Preview');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', defaultProps.ticketUrl);

    // Check that the download link has the correct href and is accessible
    const downloadLink = screen.getByRole('link', { name: /Download/i });
    expect(downloadLink).toBeInTheDocument();
    expect(downloadLink).toHaveAttribute('href', defaultProps.downloadUrl);
  });
});