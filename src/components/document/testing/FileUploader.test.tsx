// src/components/FileUploader.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import FileUploader from '../FileUploader';

// Mock lucide-react for simplicity
jest.mock('lucide-react', () => ({
  X: (props: React.ComponentProps<'div'>) => <div data-testid="x-icon" {...props} />,
}));

// Mock axios to control backend API responses
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock the global fetch API used for Cloudinary
global.fetch = jest.fn();

// Mock window.URL methods used for preview
window.URL.createObjectURL = jest.fn(() => 'blob:http://localhost/mock-preview-url');
window.URL.revokeObjectURL = jest.fn();

describe('FileUploader Component', () => {
  // Define default props and mock functions to be used in tests
  const defaultProps = {
    docType: 'Passport' as const,
    onFileSelect: jest.fn(),
    showValidation: false,
    selectedFile: null,
    onUploadError: jest.fn(),
    onRecordCreated: jest.fn(),
  };

  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- TEST CASE 1: File selection and UI update ---
  test('allows a user to select a valid file and updates the UI', async () => {
    render(<FileUploader {...defaultProps} />);
    
    const file = new File(['hello'], 'passport.png', { type: 'image/png' });
    const input = screen.getByText(/browse to choose a file/i).closest('div')?.parentElement?.parentElement?.previousElementSibling;
    
    expect(input).toBeInTheDocument();

    // Simulate the user selecting a file
    fireEvent.change(input!, { target: { files: [file] } });

    // Wait for the component to process the file
    await waitFor(() => {
      // Check that the onFileSelect callback was called with the file
      expect(defaultProps.onFileSelect).toHaveBeenCalledWith(file);
    });

    // We can't directly test the state, so we test the props of the re-rendered component
    // To do this, we re-render with the new props that the parent would pass down.
    render(<FileUploader {...defaultProps} selectedFile={file} />);

    // Check that the UI now shows the selected file's name and size
    expect(screen.getByText('passport.png')).toBeInTheDocument();
    expect(screen.getByText('0.00 MB')).toBeInTheDocument(); // File size is very small
    expect(screen.getByRole('button', { name: /upload file/i })).not.toBeDisabled();
  });

  // --- TEST CASE 2: Invalid file selection shows an error ---
  test('shows a validation error when an invalid file type is selected', async () => {
    render(<FileUploader {...defaultProps} />);
    
    const file = new File(['some content'], 'document.txt', { type: 'text/plain' });
    const input = screen.getByText(/browse to choose a file/i).closest('div')?.parentElement?.parentElement?.previousElementSibling;

    fireEvent.change(input!, { target: { files: [file] } });

    // The component should show an error message
    expect(await screen.findByText('Please select a valid file (PDF, JPG, PNG)')).toBeInTheDocument();

    // The onFileSelect callback should have been called with null because the file is invalid
    expect(defaultProps.onFileSelect).toHaveBeenCalledWith(null);
  });

  // --- TEST CASE 3: Successful upload flow ---
  test('handles a full successful upload process', async () => {
    const file = new File(['(⌐□_□)'], 'cool.png', { type: 'image/png' });
    const mockCloudinaryResponse = { secure_url: 'http://cloudinary.com/cool.png' };
    const mockBackendResponse = { id: 99, idType: 'Passport', userId: 1, documentPath: 'http://cloudinary.com/cool.png', uploadDate: new Date().toISOString() };
    
    // Mock the fetch call to Cloudinary
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCloudinaryResponse,
    });
    
    // Mock the axios call to our backend
    mockedAxios.post.mockResolvedValueOnce({ data: mockBackendResponse });

    // Render the component with a file already selected
    render(<FileUploader {...defaultProps} selectedFile={file} />);

    const uploadButton = screen.getByRole('button', { name: /upload file/i });
    fireEvent.click(uploadButton);

    // Check for uploading state
    expect(await screen.findByText('Uploading...')).toBeInTheDocument();

    // Wait for the final callback to be called
    await waitFor(() => {
      expect(defaultProps.onRecordCreated).toHaveBeenCalledTimes(1);
    });

    // Check that onRecordCreated was called with the correct data
    // We use expect.any(Object) for the file as it's hard to match exactly
    expect(defaultProps.onRecordCreated).toHaveBeenCalledWith(
      expect.objectContaining({ id: 99, documentPath: 'http://cloudinary.com/cool.png' }),
      expect.any(Object)
    );

    // Verify the API calls were made correctly
    expect(fetch).toHaveBeenCalledWith("https://api.cloudinary.com/v1_1/dugfqlrog/auto/upload", expect.any(Object));
    expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:5030/api/Documents', expect.any(Object), expect.any(Object));
  });

  // --- TEST CASE 4: Upload fails if backend save fails ---
  test('shows an error if Cloudinary succeeds but the backend fails', async () => {
    const file = new File(['data'], 'fail.pdf', { type: 'application/pdf' });
    const mockCloudinaryResponse = { secure_url: 'http://cloudinary.com/fail.pdf' };
    
    // Mock the successful fetch call to Cloudinary
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCloudinaryResponse,
    });
    
    // Mock the failed axios call to our backend
    const backendError = new Error('Database connection lost');
    mockedAxios.post.mockRejectedValueOnce(backendError);

    render(<FileUploader {...defaultProps} selectedFile={file} />);

    fireEvent.click(screen.getByRole('button', { name: /upload file/i }));

    // Wait for the error message to appear
    const errorMessage = await screen.findByText(/file uploaded, but db save failed/i);
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveTextContent('File uploaded, but DB save failed: Database connection lost. Try saving details or re-upload.');

    // Check that the parent error handler was called
    expect(defaultProps.onUploadError).toHaveBeenCalledWith(expect.stringContaining('Database connection lost'));
  });

});