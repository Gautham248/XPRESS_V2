import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import toast from 'react-hot-toast';
import Documents from '../Documents';
import { DocumentType } from '../types';

// Mock dependencies
jest.mock('axios');
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(() => 'toast-id'),
  },
  Toaster: () => <div data-testid="toaster" />,
}));

// Mock child components
jest.mock('../DocumentTabs', () => {
  return function MockDocumentTabs({ activeTab, setActiveTab }: { 
    activeTab: DocumentType; 
    setActiveTab: (tab: DocumentType) => void 
  }) {
    return (
      <div data-testid="document-tabs">
        <button 
          onClick={() => setActiveTab('Passport')}
          data-testid="passport-tab"
          className={activeTab === 'Passport' ? 'active' : ''}
        >
          Passport
        </button>
        <button 
          onClick={() => setActiveTab('Visa')}
          data-testid="visa-tab"
          className={activeTab === 'Visa' ? 'active' : ''}
        >
          Visa
        </button>
        <button 
          onClick={() => setActiveTab('Aadhar')}
          data-testid="aadhar-tab"
          className={activeTab === 'Aadhar' ? 'active' : ''}
        >
          Aadhar
        </button>
      </div>
    );
  };
});

jest.mock('../DocumentForm', () => {
  return function MockDocumentForm({ docType, formState, dispatch, recordId, onSave }: {
    docType: DocumentType;
    formState: any;
    dispatch: any;
    recordId: number | null;
    onSave: (formState: any, recordId: number, docType: DocumentType) => Promise<void>;
  }) {
    return (
      <div data-testid="document-form">
        <div data-testid="form-doc-type">{docType}</div>
        <div data-testid="form-record-id">{recordId || 'null'}</div>
        <button 
          onClick={() => recordId && onSave(formState, recordId, docType)}
          data-testid="save-button"
        >
          Save
        </button>
      </div>
    );
  };
});

jest.mock('../DocumentList', () => {
  // Use a stateful mock to track the 'key' prop for re-rendering checks if needed
  let renderCount = 0;
  return function MockDocumentList({ docType, userId }: { 
    docType: DocumentType; 
    userId: number | undefined 
  }) {
    renderCount++;
    return (
      <div data-testid="document-list" data-render-count={renderCount}>
        <div data-testid="list-doc-type">{docType}</div>
        <div data-testid="list-user-id">{userId || ''}</div>
      </div>
    );
  };
});


jest.mock('../FileUploader', () => {
  return function MockFileUploader({ userId, docType, onFileSelect, onRecordCreated, selectedFile, showValidation }: {
    userId: number | undefined;
    docType: DocumentType;
    onFileSelect: (file: File | null) => void;
    onRecordCreated: (record: any, file: File) => void;
    selectedFile: File | null;
    showValidation: boolean;
  }) {
    return (
      <div data-testid="file-uploader">
        <div data-testid="uploader-doc-type">{docType}</div>
        <input
          type="file"
          data-testid="file-input"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
            onFileSelect(e.target.files?.[0] || null)
          }
        />
        <button
          onClick={() => {
            const mockRecord = { id: 123, uploadDate: new Date().toISOString() };
            const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
            onRecordCreated(mockRecord, mockFile);
          }}
          data-testid="create-record-button"
        >
          Create Record
        </button>
        {showValidation && <div data-testid="validation-error">File validation error</div>}
      </div>
    );
  };
});

jest.mock('../OCRProcessor', () => {
  return function MockOcrProcessor({ fileToProcess, onComplete, onCancel }: {
    fileToProcess: File;
    onComplete: (text: string) => void;
    onCancel: () => void;
  }) {
    return (
      <div data-testid="ocr-processor">
        <div data-testid="processing-file">{fileToProcess?.name}</div>
        <button 
          onClick={() => onComplete('Mock OCR text result')}
          data-testid="complete-ocr"
        >
          Complete OCR
        </button>
        <button 
          onClick={onCancel}
          data-testid="cancel-ocr"
        >
          Cancel OCR
        </button>
      </div>
    );
  };
});

jest.mock('../Parsers/PassportParser', () => {
  return function MockPassportParser({ rawText, onDataParsed }: {
    rawText: string;
    onDataParsed: (data: any) => void;
  }) {
    return (
      <div data-testid="passport-parser">
        <button
          onClick={() => onDataParsed({
            passportNumber: 'P123456',
            issuingCountry: 'India',
            issueDate: '2020-01-01',
            expiryDate: '2030-01-01'
          })}
          data-testid="parse-passport"
        >
          Parse Passport
        </button>
      </div>
    );
  };
});

jest.mock('../Parsers/VisaParser', () => {
  return function MockVisaParser({ rawText, onDataParsed }: {
    rawText: string;
    onDataParsed: (data: any) => void;
  }) {
    return (
      <div data-testid="visa-parser">
        <button
          onClick={() => onDataParsed({
            visaNumber: 'V123456',
            visaClass: 'Tourist',
            issuingCountry: 'USA',
            issueDate: '2024-01-01',
            expiryDate: '2025-01-01'
          })}
          data-testid="parse-visa"
        >
          Parse Visa
        </button>
      </div>
    );
  };
});

jest.mock('../Parsers/AadharParser', () => {
  return function MockAadharParser({ rawText, onDataParsed }: {
    rawText: string;
    onDataParsed: (data: any) => void;
  }) {
    return (
      <div data-testid="aadhar-parser">
        <button
          onClick={() => onDataParsed({
            idNumber: '123456789012',
            fullName: 'John Doe'
          })}
          data-testid="parse-aadhar"
        >
          Parse Aadhar
        </button>
      </div>
    );
  };
});

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Documents Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock localStorage
    const mockUser = {
      role: 'user',
      userId: '123'
    };
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => JSON.stringify(mockUser)),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  describe('Component Rendering', () => {
    test('renders main component structure correctly', () => {
      render(<Documents />);
      
      expect(screen.getByText('Travel Documents')).toBeInTheDocument();
      expect(screen.getByText('Step 1: Upload Document')).toBeInTheDocument();
      expect(screen.getByText('Step 2: Verify & Save Information')).toBeInTheDocument();
      expect(screen.getByText('Existing Documents')).toBeInTheDocument();
      expect(screen.getByTestId('toaster')).toBeInTheDocument();
    });

    test('renders child components with correct props', () => {
      render(<Documents />);
      
      expect(screen.getByTestId('document-tabs')).toBeInTheDocument();
      expect(screen.getByTestId('document-form')).toBeInTheDocument();
      expect(screen.getByTestId('document-list')).toBeInTheDocument();
      expect(screen.getByTestId('file-uploader')).toBeInTheDocument();
    });

    test('defaults to Passport tab as active', () => {
      render(<Documents />);
      
      expect(screen.getByTestId('form-doc-type')).toHaveTextContent('Passport');
      expect(screen.getByTestId('uploader-doc-type')).toHaveTextContent('Passport');
      expect(screen.getByTestId('list-doc-type')).toHaveTextContent('Passport');
    });
  });

  describe('Tab Navigation', () => {
    test('switches active tab when tab is clicked', async () => {
      const user = userEvent.setup();
      render(<Documents />);
      
      // Initially on Passport tab
      expect(screen.getByTestId('form-doc-type')).toHaveTextContent('Passport');
      
      // Switch to Visa tab
      await user.click(screen.getByTestId('visa-tab'));
      expect(screen.getByTestId('form-doc-type')).toHaveTextContent('Visa');
      
      // Switch to Aadhar tab
      await user.click(screen.getByTestId('aadhar-tab'));
      expect(screen.getByTestId('form-doc-type')).toHaveTextContent('Aadhar');
    });

    test('updates all child components when tab changes', async () => {
      const user = userEvent.setup();
      render(<Documents />);
      
      await user.click(screen.getByTestId('visa-tab'));
      
      expect(screen.getByTestId('form-doc-type')).toHaveTextContent('Visa');
      expect(screen.getByTestId('uploader-doc-type')).toHaveTextContent('Visa');
      expect(screen.getByTestId('list-doc-type')).toHaveTextContent('Visa');
    });
  });

  describe('File Selection', () => {
    test('handles file selection correctly', async () => {
      const user = userEvent.setup();
      render(<Documents />);
      
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      const fileInput = screen.getByTestId('file-input') as HTMLInputElement;
      
      await user.upload(fileInput, file);
      
      // File should be selected (this would be verified through the FileUploader mock)
      expect(fileInput.files?.[0]).toBe(file);
    });

    test('clears file validation when file is selected', async () => {
      const user = userEvent.setup();
      render(<Documents />);
      
      // Simulate validation error first
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      const fileInput = screen.getByTestId('file-input');
      
      await user.upload(fileInput, file);
      
      // Validation error should not be shown after file selection
      expect(screen.queryByTestId('validation-error')).not.toBeInTheDocument();
    });
  });

  describe('OCR Processing', () => {
    test('initiates OCR processing when record is created', async () => {
      const user = userEvent.setup();
      render(<Documents />);
      
      await user.click(screen.getByTestId('create-record-button'));
      
      expect(screen.getByTestId('ocr-processor')).toBeInTheDocument();
      expect(screen.getByTestId('processing-file')).toHaveTextContent('test.pdf');
    });

    test('handles OCR completion and shows success toast', async () => {
      const user = userEvent.setup();
      render(<Documents />);
      
      await user.click(screen.getByTestId('create-record-button'));
      await user.click(screen.getByTestId('complete-ocr'));
      
      expect(toast.success).toHaveBeenCalledWith('Scan complete. Displaying parsed data...');
      expect(screen.queryByTestId('ocr-processor')).not.toBeInTheDocument();
    });

    test('handles OCR cancellation', async () => {
      const user = userEvent.setup();
      render(<Documents />);
      
      await user.click(screen.getByTestId('create-record-button'));
      await user.click(screen.getByTestId('cancel-ocr'));
      
      expect(screen.queryByTestId('ocr-processor')).not.toBeInTheDocument();
    });
  });

  describe('Document Parsing', () => {
    test('displays passport parser when passport tab is active and OCR is complete', async () => {
      const user = userEvent.setup();
      render(<Documents />);
      
      await user.click(screen.getByTestId('create-record-button'));
      await user.click(screen.getByTestId('complete-ocr'));
      
      expect(screen.getByTestId('passport-parser')).toBeInTheDocument();
    });

    test('displays visa parser when visa tab is active and OCR is complete', async () => {
      const user = userEvent.setup();
      render(<Documents />);
      
      await user.click(screen.getByTestId('visa-tab'));
      await user.click(screen.getByTestId('create-record-button'));
      await user.click(screen.getByTestId('complete-ocr'));
      
      expect(screen.getByTestId('visa-parser')).toBeInTheDocument();
    });

    test('displays aadhar parser when aadhar tab is active and OCR is complete', async () => {
      const user = userEvent.setup();
      render(<Documents />);
      
      await user.click(screen.getByTestId('aadhar-tab'));
      await user.click(screen.getByTestId('create-record-button'));
      await user.click(screen.getByTestId('complete-ocr'));
      
      expect(screen.getByTestId('aadhar-parser')).toBeInTheDocument();
    });

    test('handles passport data parsing', async () => {
      const user = userEvent.setup();
      render(<Documents />);
      
      await user.click(screen.getByTestId('create-record-button'));
      await user.click(screen.getByTestId('complete-ocr'));
      await user.click(screen.getByTestId('parse-passport'));
      
      // Should show pending record message
      expect(screen.getByText(/Please verify the auto-filled details for record ID #123/)).toBeInTheDocument();
    });

    test('handles visa data parsing', async () => {
      const user = userEvent.setup();
      render(<Documents />);
      
      await user.click(screen.getByTestId('visa-tab'));
      await user.click(screen.getByTestId('create-record-button'));
      await user.click(screen.getByTestId('complete-ocr'));
      await user.click(screen.getByTestId('parse-visa'));
      
      expect(screen.getByText(/Please verify the auto-filled details for record ID #123/)).toBeInTheDocument();
    });

    test('handles aadhar data parsing', async () => {
      const user = userEvent.setup();
      render(<Documents />);
      
      await user.click(screen.getByTestId('aadhar-tab'));
      await user.click(screen.getByTestId('create-record-button'));
      await user.click(screen.getByTestId('complete-ocr'));
      await user.click(screen.getByTestId('parse-aadhar'));
      
      expect(screen.getByText(/Please verify the auto-filled details for record ID #123/)).toBeInTheDocument();
    });
  });

  describe('Document Saving', () => {
    beforeEach(() => {
      mockedAxios.put.mockResolvedValue({ data: {} });
      mockedAxios.delete.mockResolvedValue({ data: {} });
    });

    test('saves valid passport document successfully', async () => {
      const user = userEvent.setup();
      render(<Documents />);
      
      // Complete the flow to get a pending record
      await user.click(screen.getByTestId('create-record-button'));
      await user.click(screen.getByTestId('complete-ocr'));
      await user.click(screen.getByTestId('parse-passport'));
      
      // Save the document
      await user.click(screen.getByTestId('save-button'));
      
      await waitFor(() => {
        expect(mockedAxios.put).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith('Passport details saved successfully!', { id: 'toast-id' });
      });
    });

    test('deletes expired passport document', async () => {
      const user = userEvent.setup();
      
      // Mock the component with expired data by overriding the parser mock for this test
      jest.mock('../Parsers/PassportParser', () => {
        return function MockExpiredPassportParser({ onDataParsed }: { onDataParsed: (data: any) => void; }) {
          return (
            <div data-testid="passport-parser">
              <button onClick={() => onDataParsed({
                passportNumber: 'P123456',
                issuingCountry: 'India',
                issueDate: '2020-01-01',
                expiryDate: '2020-01-01' // Expired date
              })} data-testid="parse-passport">Parse Passport</button>
            </div>
          );
        };
      });

      render(<Documents />);
      
      await user.click(screen.getByTestId('create-record-button'));
      await user.click(screen.getByTestId('complete-ocr'));
      await user.click(screen.getByTestId('parse-passport'));
      await user.click(screen.getByTestId('save-button'));
      
      await waitFor(() => {
        expect(mockedAxios.delete).toHaveBeenCalledWith('http://localhost:5030/api/Documents/123/type/Passport');
        expect(toast.error).toHaveBeenCalledWith('This document is expired and cannot be saved.', { id: 'toast-id' });
      });
    });
  });

  describe('User Authentication', () => {
    test('handles user data from localStorage', () => {
      render(<Documents />);
      
      expect(screen.getByTestId('list-user-id')).toHaveTextContent('123');
    });

    test('handles missing user data gracefully', () => {
      const mockLocalStorage = {
        getItem: jest.fn(() => null),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      };
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
        writable: true,
      });
      
      render(<Documents />);
      
      expect(screen.getByTestId('list-user-id')).toHaveTextContent('');
    });
  });

  describe('UI State Management', () => {
    test('shows upload instruction when no pending record exists', () => {
      render(<Documents />);
      
      expect(screen.getByText(/Upload a document for the 'Passport' tab/)).toBeInTheDocument();
    });

    test('shows verification message when pending record exists', async () => {
      const user = userEvent.setup();
      render(<Documents />);
      
      await user.click(screen.getByTestId('create-record-button'));
      await user.click(screen.getByTestId('complete-ocr'));
      await user.click(screen.getByTestId('parse-passport'));
      
      expect(screen.getByText(/Please verify the auto-filled details for record ID #123/)).toBeInTheDocument();
    });

    test('clears state after successful save', async () => {
      const user = userEvent.setup();
      mockedAxios.put.mockResolvedValue({ data: {} });
      render(<Documents />);
      
      await user.click(screen.getByTestId('create-record-button'));
      await user.click(screen.getByTestId('complete-ocr'));
      await user.click(screen.getByTestId('parse-passport'));
      await user.click(screen.getByTestId('save-button'));
      
      await waitFor(() => {
        expect(screen.queryByText(/Please verify the auto-filled details/)).not.toBeInTheDocument();
        expect(screen.getByText(/Upload a document for the 'Passport' tab/)).toBeInTheDocument();
      });
    });
  });

  describe('Date Formatting', () => {
    test('formats dates to ISO string correctly', async () => {
      const user = userEvent.setup();
      mockedAxios.put.mockResolvedValue({ data: {} });
      render(<Documents />);
      
      await user.click(screen.getByTestId('create-record-button'));
      await user.click(screen.getByTestId('complete-ocr'));
      await user.click(screen.getByTestId('parse-passport'));
      await user.click(screen.getByTestId('save-button'));
      
      await waitFor(() => {
        const putCall = mockedAxios.put.mock.calls[0];
        expect(putCall).toBeDefined();
        if (putCall) {
          const payload = putCall[1] as Record<string, any>;
          // Check that dates are properly formatted
          expect(payload.uploadDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
          expect(payload.issueDate).toBe('2020-01-01T00:00:00.000Z');
          expect(payload.expiryDate).toBe('2030-01-01T00:00:00.000Z');
        }
      });
    });
  });
});