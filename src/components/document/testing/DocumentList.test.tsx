// src/components/DocumentList.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import DocumentList from '../DocumentList';

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

jest.mock('lucide-react', () => ({
  Download: (props: React.ComponentProps<'div'>) => <div data-testid="download-icon" {...props} />,
  Trash2: (props: React.ComponentProps<'div'>) => <div data-testid="delete-icon" {...props} />,
}));

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

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

    expect(await screen.findByText('P12345')).toBeInTheDocument();
    
    expect(screen.getByText('P67890')).toBeInTheDocument();
    expect(screen.getByText('USA')).toBeInTheDocument();
    
    const labels = screen.getAllByText('Passport No:');
    expect(labels.length).toBe(2);
    
    expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:5030/api/Documents/user/123/type/Passport');
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });

  // --- TEST CASE 2: Shows nothing when no documents are returned ---
  test('should render an empty list when the API returns no documents', async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });

    render(<DocumentList docType="Visa" userId={123} />);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    const listItems = screen.queryAllByRole('listitem');
    expect(listItems).toHaveLength(0);
  });


  // --- TEST CASE 3: Handles the full document deletion flow ---
  test('should open confirmation modal and delete a document on confirmation', async () => {
    const mockAadharData = [
      { id: 101, aadharNumber: '111122223333', aadharName: 'John Doe', documentPath: 'path/to/aadhar.pdf' }
    ];
    mockedAxios.get.mockResolvedValue({ data: mockAadharData });
    mockedAxios.delete.mockResolvedValue({}); 

    render(<DocumentList docType="Aadhar" userId={123} />);

    const documentText = await screen.findByText('111122223333');
    expect(documentText).toBeInTheDocument();

    const listItem = screen.getByText('111122223333').closest('li');
    const deleteIcon = within(listItem!).getByTestId('delete-icon');
    fireEvent.click(deleteIcon);
    
    expect(await screen.findByText('Confirm Deletion')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this document?')).toBeInTheDocument();

    const confirmDeleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(confirmDeleteButton);

    await waitFor(() => {
      expect(screen.queryByText('111122223333')).not.toBeInTheDocument();
    });
    
    expect(mockedAxios.delete).toHaveBeenCalledWith('http://localhost:5030/api/Documents/101/type/Aadhar');
    expect(toast.success).toHaveBeenCalledWith('Document deleted successfully');
  });

  // --- TEST CASE 4: Handles API error during initial fetch ---
  test('should show an error toast if fetching documents fails', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Network Error'));

    render(<DocumentList docType="Passport" userId={123} />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to fetch documents');
    });

    expect(screen.queryByText('Passport No:')).not.toBeInTheDocument();
  });

});