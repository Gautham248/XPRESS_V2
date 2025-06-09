// src/components/FileUploader.test.tsx

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import axios from 'axios';
import FileUploader from '../FileUploader';

// Mocks for dependencies
jest.mock('lucide-react', () => ({
  X: (props: React.ComponentProps<'div'>) => <div data-testid="x-icon" {...props} />,
}));
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
global.fetch = jest.fn();
window.URL.createObjectURL = jest.fn(() => 'blob:http://localhost/mock-preview-url');

// We still need a data-testid on the input for reliable selection
// Please ensure this is in your FileUploader.tsx:
// <input data-testid="file-input" ... />

describe('FileUploader Component', () => {
  const defaultProps = {
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

  // ✅ TEST 1: This test should pass.
  test('calls onFileSelect with the file when a user selects a valid file', async () => {
    const user = userEvent.setup();
    render(<FileUploader {...defaultProps} />);
    const file = new File(['hello'], 'passport.png', { type: 'image/png' });
    await user.upload(screen.getByTestId('file-input'), file);
    await waitFor(() => {
      expect(defaultProps.onFileSelect).toHaveBeenCalledWith(file);
    });
  });

  // ✅ --- FIX FOR TEST 2 --- ✅
  // This test now ONLY checks that the correct callback is fired with `null`.
  // It no longer looks for an error message that the component doesn't render.
 test('shows a validation error when an invalid file type is selected', async () => {
    render(<FileUploader {...defaultProps} />);
    
    const invalidFile = new File(['some content'], 'document.txt', { type: 'text/plain' });
    const input = screen.getByTestId('file-input');

    // 1. Use the low-level fireEvent to guarantee the change event is dispatched.
    //    This is the most direct way to trigger the component's `handleFileChange` handler.
    fireEvent.change(input, {
      target: {
        files: [invalidFile],
      },
    });

    // 2. Wait for the visual error message to appear. `findByTestId` will poll the DOM.
    const errorMessage = await screen.findByTestId('error-message');
    
    // 3. Assert that the error message is correct.
    expect(errorMessage).toHaveTextContent(
      'Please select a valid file (PDF, JPG, PNG)'
    );

    // 4. Assert that the parent component was correctly notified.
    expect(defaultProps.onFileSelect).toHaveBeenCalledWith(null);
});
  // ✅ --- FIX FOR TEST 3 --- ✅
  // This test now correctly waits for the final callback.
  test('handles a full successful upload process', async () => {
    const user = userEvent.setup();
    const file = new File(['(⌐□_□)'], 'cool.png', { type: 'image/png' });
    const mockCloudinaryResponse = { secure_url: 'http://cloudinary.com/cool.png' };
    const mockBackendResponse = { id: 99, idType: 'Passport', userId: 1, documentPath: 'http://cloudinary.com/cool.png', uploadDate: new Date().toISOString() };
    
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCloudinaryResponse,
    });
    mockedAxios.post.mockResolvedValueOnce({ data: mockBackendResponse });

    // Render with a file selected so the "Upload" button is enabled.
    render(<FileUploader {...defaultProps} selectedFile={file} />);

    await user.click(screen.getByRole('button', { name: /upload file/i }));

    // Wait for the final "success" callback to be fired. This is the most reliable
    // way to know the entire async chain has completed.
    await waitFor(() => {
      expect(defaultProps.onRecordCreated).toHaveBeenCalledTimes(1);
    }, { timeout: 2000 });

    // Now we can assert what it was called with.
    expect(defaultProps.onRecordCreated).toHaveBeenCalledWith(
      expect.objectContaining({ id: 99 }),
      file
    );
  });
  
  // ✅ TEST 4: This test should pass as it checks a callback.
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
        expect(defaultProps.onUploadError).toHaveBeenCalledWith(expect.stringContaining('Database connection lost'));
    });
  });
});