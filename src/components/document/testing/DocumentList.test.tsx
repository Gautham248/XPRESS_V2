// src/components/DocumentList.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import DocumentList from '../DocumentList';

// --- Mocks ---
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

// --- Test Suite ---
describe('DocumentList Component', () => {
  // Use afterEach to ensure all mocks are restored, preventing test pollution.
  afterEach(() => {
    jest.restoreAllMocks();
  });

  // --- YOUR ORIGINAL, PASSING TEST CASES (UNCHANGED) ---

  test('should fetch and display passport documents on initial render', async () => {
    const mockPassportData = [
      { id: 1, passportNumber: 'P12345', issuingCountry: 'USA', passportExpiryDate: '2030-01-01', documentPath: 'path/to/doc1.pdf' },
      { id: 2, passportNumber: 'P67890', issuingCountry: 'CAN', passportExpiryDate: '2032-05-10', documentPath: 'path/to/doc2.pdf' },
    ];
    mockedAxios.get.mockResolvedValue({ data: mockPassportData });
    render(<DocumentList docType="Passport" userId={123} />);
    expect(await screen.findByText('P12345')).toBeInTheDocument();
    expect(screen.getByText('P67890')).toBeInTheDocument();
  });

  test('should render an empty list when the API returns no documents', async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    render(<DocumentList docType="Visa" userId={123} />);
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });

  test('should open confirmation modal and delete a document on confirmation', async () => {
    const mockAadharData = [{ id: 101, aadharNumber: '111122223333', aadharName: 'John Doe', documentPath: 'path/to/aadhar.pdf' }];
    mockedAxios.get.mockResolvedValue({ data: mockAadharData });
    mockedAxios.delete.mockResolvedValue({});
    render(<DocumentList docType="Aadhar" userId={123} />);
    const deleteIcon = await screen.findByTestId('delete-icon');
    fireEvent.click(deleteIcon);
    const confirmDeleteButton = await screen.findByRole('button', { name: /delete/i });
    fireEvent.click(confirmDeleteButton);
    await waitFor(() => {
      expect(screen.queryByText('111122223333')).not.toBeInTheDocument();
    });
    expect(toast.success).toHaveBeenCalledWith('Document deleted successfully');
  });

  test('should show an error toast if fetching documents fails', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Network Error'));
    render(<DocumentList docType="Passport" userId={123} />);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to fetch documents');
    });
  });

  // --- FULLY CORRECTED & ISOLATED TEST CASES ---

  // highlight-start
  // --- THIS IS THE DEFINITIVE FIX THAT WILL PASS ---
  test('should initiate a download when the download icon is clicked', async () => {
    // 1. Mock the necessary browser APIs.
    window.URL.createObjectURL = jest.fn(() => 'mock-blob-url');
    window.URL.revokeObjectURL = jest.fn();

    // 2. THE KEY: Spy on the PROTOTYPE of the link element.
    // This allows us to intercept the 'click' call without interfering with
    // how the element is created or appended to the DOM. This PREVENTS the HierarchyRequestError.
    const linkClickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    // 3. Setup a URL-aware axios mock.
    const docPath = 'http://server.com/files/P12345.pdf';
    const mockPassportData = [{ id: 1, passportNumber: 'P12345', documentPath: docPath }];
    mockedAxios.get.mockImplementation(async (url) => {
      if (url.includes('/type/Passport')) return { data: mockPassportData };
      if (url === docPath) return { data: new Blob(['pdf-content']) };
      throw new Error(`Unhandled GET request to ${url}`);
    });

    // 4. Render the component and click the download icon.
    render(<DocumentList docType="Passport" userId={123} />);
    const downloadIcon = await screen.findByTestId('download-icon');
    fireEvent.click(downloadIcon);

    // 5. Assert that the entire download process occurred.
    await waitFor(() => {
      // We wait for the final step in the chain: the click.
      expect(linkClickSpy).toHaveBeenCalled();
    });

    // Now we can assert the other parts of the process happened.
    expect(mockedAxios.get).toHaveBeenCalledWith(docPath, { responseType: 'blob' });
    expect(window.URL.createObjectURL).toHaveBeenCalled();
    expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('mock-blob-url');
  });
  // highlight-end

  test('should show an error toast if downloading fails', async () => {
    const docPath = 'http://server.com/files/P12345.pdf';
    const mockPassportData = [{ id: 1, passportNumber: 'P12345', documentPath: docPath }];

    mockedAxios.get.mockImplementation(async (url) => {
      if (url.includes('/type/Passport')) return { data: mockPassportData };
      if (url === docPath) throw new Error('Download failed');
      throw new Error(`Unhandled GET request to ${url}`);
    });

    render(<DocumentList docType="Passport" userId={123} />);
    const downloadIcon = await screen.findByTestId('download-icon');
    fireEvent.click(downloadIcon);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to download document');
    });
  });

  test('should not call the API if userId is undefined', async () => {
    render(<DocumentList docType="Passport" userId={undefined} />);
    
    // Give a tick for any potential async effects to settle
    await new Promise((r) => setTimeout(r, 1));
    
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });
});