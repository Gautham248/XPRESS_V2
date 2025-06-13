import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Modal from '../Modal';

// Mock the exportData function
jest.mock('../exportData', () => ({
  exportData: jest.fn()
}));

import { exportData } from '../exportData';

describe('Modal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: 'Test Modal',
    children: <div>Modal Content</div>
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test Case 1: Modal renders when isOpen is true
  test('renders modal when isOpen is true', () => {
    render(<Modal {...defaultProps} />);
    
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
    expect(screen.getByText('Report Date Range: All Time')).toBeInTheDocument();
  });

  // Test Case 2: Modal does not render when isOpen is false
  test('does not render modal when isOpen is false', () => {
    render(<Modal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
  });

  // Test Case 3: Close button functionality
  test('calls onClose when close button is clicked', () => {
    const mockOnClose = jest.fn();
    render(<Modal {...defaultProps} onClose={mockOnClose} />);
    
    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  // Test Case 4: Date range display with custom dates
  test('displays correct date range when startDate and endDate are provided', () => {
    const props = {
      ...defaultProps,
      startDate: '2024-01-01',
      endDate: '2024-12-31'
    };
    
    render(<Modal {...props} />);
    
    expect(screen.getByText('Report Date Range: January 1, 2024 to December 31, 2024')).toBeInTheDocument();
  });

  // Test Case 5: Export functionality with export data
  test('handles export functionality when export data is provided', async () => {
    const mockExportData = {
      headers: ['Name', 'Date', 'Amount'],
      data: [
        { name: 'Trip 1', date: '2024-01-01', amount: 1000 },
        { name: 'Trip 2', date: '2024-02-01', amount: 1500 }
      ],
      filename: 'test-export'
    };

    const props = {
      ...defaultProps,
      title: 'International Flights Report',
      exportData: mockExportData
    };

    render(<Modal {...props} />);
    
    const exportButton = screen.getByText('Export International Data');
    expect(exportButton).toBeEnabled();
    
    fireEvent.click(exportButton);
    
    await waitFor(() => {
      expect(exportData).toHaveBeenCalledWith({
        filename: 'test-export',
        headers: ['Name', 'Date', 'Amount'],
        data: mockExportData.data,
        title: 'International Flights Report',
        dateRange: 'Report Date Range: All Time'
      });
    });
  });
});