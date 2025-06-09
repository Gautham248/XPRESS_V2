// src/components/DocumentList.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import DocumentList from '../DocumentList';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

// Mock lucide-react icons for simplicity in tests
jest.mock('lucide-react', () => ({
  Download: (props: React.ComponentProps<'div'>) => <div data-testid="download-icon" {...props} />,
  Trash2: (props: React.ComponentProps<'div'>) => <div data-testid="delete-icon" {...props} />,
}));

// Mock axios to control API responses
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock window.URL methods used for download
window.URL.createObjectURL = jest.fn();
window.URL.revokeObjectURL = jest.fn();


describe('DocumentList Component', () => {

  // Clear mocks before each test to ensure isolation
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- TEST CASE 1: Renders the list with documents on successful fetch ---
  test('should fetch and display passport documents on initial render', async () => {
    const mockPassportData = [
      { id: 1, passportNumber: 'P12345', issuingCountry: 'USA', passportExpiryDate: '2030-01-01', documentPath: 'path/to/doc1.pdf' },
      { id: 2, passportNumber: 'P67890', issuingCountry: 'CAN', passportExpiryDate: '2032-05-10', documentPath: 'path/to/doc2.pdf' },
    ];
    mockedAxios.get.mockResolvedValue({ data: mockPassportData });

    render(<DocumentList docType="Passport" userId={123} />);

    // ✅ --- THE FIX IS HERE --- ✅
    // Instead of waiting for a generic label, wait for specific data from the mock to appear.
    // This is more reliable and confirms the component has processed the API response.
    expect(await screen.findByText('P12345')).toBeInTheDocument();
    
    // Now that we know the component has rendered, we can safely check for the other elements.
    expect(screen.getByText('P67890')).toBeInTheDocument();
    expect(screen.getByText('USA')).toBeInTheDocument();
    
    // You can still check for the labels, but you don't need to 'await' them anymore.
    const labels = screen.getAllByText('Passport No:');
    expect(labels.length).toBe(2);
    
    // Verify that the correct API endpoint was called
    expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:5030/api/Documents/user/123/type/Passport');
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });

  // --- TEST CASE 2: Shows nothing when no documents are returned ---
  test('should render an empty list when the API returns no documents', async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });

    render(<DocumentList docType="Visa" userId={123} />);

    // Wait for the useEffect to complete
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    // Check that no list items are rendered
    const listItems = screen.queryAllByRole('listitem');
    expect(listItems).toHaveLength(0);
  });


  // --- TEST CASE 3: Handles the full document deletion flow ---
  test('should open confirmation modal and delete a document on confirmation', async () => {
    const mockAadharData = [
      { id: 101, aadharNumber: '111122223333', aadharName: 'John Doe', documentPath: 'path/to/aadhar.pdf' }
    ];
    mockedAxios.get.mockResolvedValue({ data: mockAadharData });
    mockedAxios.delete.mockResolvedValue({}); // Mock successful deletion

    render(<DocumentList docType="Aadhar" userId={123} />);

    // 1. Wait for the initial document to be rendered
    const documentText = await screen.findByText('111122223333');
    expect(documentText).toBeInTheDocument();

    // 2. Find the delete icon within the specific list item and click it
    const listItem = screen.getByText('111122223333').closest('li');
    const deleteIcon = within(listItem!).getByTestId('delete-icon');
    fireEvent.click(deleteIcon);
    
    // 3. Confirm that the deletion modal appears
    expect(await screen.findByText('Confirm Deletion')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this document?')).toBeInTheDocument();

    // 4. Click the final "Delete" button in the modal
    const confirmDeleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(confirmDeleteButton);

    // 5. Wait for the UI to update and verify the document is gone
    await waitFor(() => {
      expect(screen.queryByText('111122223333')).not.toBeInTheDocument();
    });
    
    // 6. Verify the correct API endpoint was called for deletion
    expect(mockedAxios.delete).toHaveBeenCalledWith('http://localhost:5030/api/Documents/101/type/Aadhar');
    expect(toast.success).toHaveBeenCalledWith('Document deleted successfully');
  });

  // --- TEST CASE 4: Handles API error during initial fetch ---
  test('should show an error toast if fetching documents fails', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Network Error'));

    render(<DocumentList docType="Passport" userId={123} />);

    // Wait for the error handling logic to complete
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to fetch documents');
    });

    // Ensure no documents are rendered on the screen
    expect(screen.queryByText('Passport No:')).not.toBeInTheDocument();
  });

});