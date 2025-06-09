// src/components/FileUploader.test.tsx

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import axios from 'axios';
import FileUploader, { BackendDocumentRecord } from '../FileUploader'; // Import type for clarity
import { DocumentType } from '../types';

// Mocks for dependencies
jest.mock('lucide-react', () => ({
  X: (props: React.ComponentProps<'div'>) => <div data-testid="x-icon" {...props} />,
}));
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
global.fetch = jest.fn();
window.URL.createObjectURL = jest.fn(() => 'blob:http://localhost/mock-preview-url');

// Define the type for our props object for better type safety in tests
type TestProps = {
  userId: number | undefined;
  docType: DocumentType;
  onFileSelect: (file: File | null) => void;
  showValidation: boolean;
  selectedFile: File | null;
  onUploadError: (error: string) => void;
  onRecordCreated: (record: BackendDocumentRecord, uploadedFile: File) => void;
};

describe('FileUploader Component', () => {
  // ✅ --- FIX: Added the required 'userId' prop --- ✅
  const defaultProps: TestProps = {
    userId: 1, // Added a default userId
    docType: 'Passport' as const,
    onFileSelect: jest.fn(),
    showValidation: false,
    selectedFile: null,
    onUploadError: jest.fn(),
    onRecordCreated: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TEST 1: This test should pass.
  test('calls onFileSelect with the file when a user selects a valid file', async () => {
    const user = userEvent.setup();
    render(<FileUploader {...defaultProps} />);
    const file = new File(['hello'], 'passport.png', { type: 'image/png' });
    const input = screen.getByTestId('file-input');
    await user.upload(input, file);
    await waitFor(() => {
      expect(defaultProps.onFileSelect).toHaveBeenCalledWith(file);
    });
  });

  // TEST 2: Invalid file type selection
  test('shows a validation error when an invalid file type is selected', async () => {
    render(<FileUploader {...defaultProps} />);
    
    const invalidFile = new File(['some content'], 'document.txt', { type: 'text/plain' });
    const input = screen.getByTestId('file-input');

    // Use fireEvent for direct event simulation
    fireEvent.change(input, {
      target: {
        files: [invalidFile],
      },
    });

    // Wait for the visual error message to appear
    const errorMessage = await screen.findByTestId('error-message');
    
    // Assert the error message is correct
    expect(errorMessage).toHaveTextContent(
      'Please select a valid file (PDF, JPG, PNG)'
    );

    // Assert the parent component was correctly notified of the invalid selection
    expect(defaultProps.onFileSelect).toHaveBeenCalledWith(null);
  });

  // TEST 3: Full successful upload process
  test('handles a full successful upload process', async () => {
    const user = userEvent.setup();
    const file = new File(['(⌐□_□)'], 'cool.png', { type: 'image/png' });
    const mockCloudinaryResponse = { secure_url: 'http://cloudinary.com/cool.png' };
    const mockBackendResponse: BackendDocumentRecord = { 
      id: 99, 
      idType: 'Passport', 
      userId: 1, 
      documentPath: 'http://cloudinary.com/cool.png', 
      uploadDate: new Date(),
      createdBy: 1
    };
    
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCloudinaryResponse,
    });
    mockedAxios.post.mockResolvedValueOnce({ data: mockBackendResponse });

    // Render with a file selected so the "Upload" button is enabled.
    render(<FileUploader {...defaultProps} selectedFile={file} />);

    await user.click(screen.getByRole('button', { name: /upload file/i }));

    // Wait for the final "success" callback to be fired.
    await waitFor(() => {
      expect(defaultProps.onRecordCreated).toHaveBeenCalledTimes(1);
    }, { timeout: 2000 });

    // Assert what it was called with.
    expect(defaultProps.onRecordCreated).toHaveBeenCalledWith(
      expect.objectContaining({ id: 99, userId: 1 }), // Check for userId as well
      file
    );
  });
  
  // TEST 4: Backend failure after successful cloud upload
  test('calls onUploadError if Cloudinary succeeds but the backend fails', async () => {
    const user = userEvent.setup();
    const file = new File(['data'], 'fail.pdf', { type: 'application/pdf' });
    const mockCloudinaryResponse = { secure_url: 'http://cloudinary.com/fail.pdf' };
    
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCloudinaryResponse,
    });
    
    const backendError = new Error('Database connection lost');
    mockedAxios.post.mockRejectedValueOnce(backendError);

    render(<FileUploader {...defaultProps} selectedFile={file} />);
    await user.click(screen.getByRole('button', { name: /upload file/i }));

    // Wait for the onUploadError callback to be fired.
    await waitFor(() => {
        expect(defaultProps.onUploadError).toHaveBeenCalledWith(
          expect.stringContaining('Database connection lost')
        );
    });
  });
});