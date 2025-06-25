import { exportData } from '../exportData'; // Adjust import path as needed

// Mock dependencies
const mockXLSX = {
  utils: {
    book_new: jest.fn(() => ({})),
    aoa_to_sheet: jest.fn(() => ({ '!cols': [] })),
    book_append_sheet: jest.fn(),
  },
  writeFile: jest.fn(),
};

// Mock DOM methods
const mockCreateElement = jest.fn();
const mockAppendChild = jest.fn();
const mockRemoveChild = jest.fn();
const mockClick = jest.fn();
const mockCreateObjectURL = jest.fn();
const mockRevokeObjectURL = jest.fn();

// Setup mocks before tests
beforeAll(() => {
  // Mock document methods
  document.createElement = mockCreateElement;
  
  // Mock document.head and document.body properly
  Object.defineProperty(document, 'head', {
    value: { appendChild: mockAppendChild },
    writable: true,
    configurable: true
  });
  
  Object.defineProperty(document, 'body', {
    value: { appendChild: mockAppendChild, removeChild: mockRemoveChild },
    writable: true,
    configurable: true
  });
  
  // Mock URL methods
  global.URL = {
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL,
  } as any;
  
  // Mock Blob
  global.Blob = jest.fn(() => ({})) as any;
  
  // Mock alert
  global.alert = jest.fn();
});

describe('exportData Function Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset window.XLSX
    delete (window as any).XLSX;
  });

  // Test Case 1: Successful Excel Export with Complete Data
  test('should successfully export complete travel data to Excel', async () => {
    // Mock script loading success
    mockCreateElement.mockReturnValue({
      src: '',
      onload: null,
      onerror: null,
      style: { visibility: '' },
      setAttribute: jest.fn(),
    });

    // Mock successful XLSX loading
    const mockScript = {
      onload: jest.fn(),
      onerror: jest.fn(),
    };
    mockCreateElement.mockReturnValue(mockScript);

    const testData = [
      {
        employee_name: 'John Doe',
        travel_type: 'domestic',
        destination: 'Mumbai',
        amount: '₹15,000',
        date: '2024-01-15'
      },
      {
        employee_name: 'Jane Smith',
        travel_type: 'international',
        destination: 'Singapore',
        amount: '₹85,000',
        date: '2024-02-20'
      }
    ];

    const options = {
      filename: 'test-travel-data',
      headers: ['Employee Name', 'Travel Type', 'Destination', 'Amount', 'Date'],
      data: testData,
      title: 'Travel Expense Report',
      dateRange: 'January 2024 - February 2024'
    };

    // Simulate successful XLSX loading
    setTimeout(() => {
      (window as any).XLSX = mockXLSX;
      mockScript.onload();
    }, 0);

    await exportData(options);

    expect(mockCreateElement).toHaveBeenCalledWith('script');
    expect(mockXLSX.utils.book_new).toHaveBeenCalled();
    expect(mockXLSX.utils.aoa_to_sheet).toHaveBeenCalled();
    expect(mockXLSX.utils.book_append_sheet).toHaveBeenCalled();
    expect(mockXLSX.writeFile).toHaveBeenCalledWith({}, 'test-travel-data.xlsx');
  });

  // Test Case 2: XLSX Library Load Failure - CSV Fallback
  test('should fallback to CSV export when XLSX library fails to load', async () => {
    const mockScript = {
      onload: jest.fn(),
      onerror: jest.fn(),
    };
    const mockLink = {
      setAttribute: jest.fn(),
      style: { visibility: '' },
      click: mockClick,
    };

    mockCreateElement
      .mockReturnValueOnce(mockScript) // First call for script
      .mockReturnValueOnce(mockLink);  // Second call for download link

    mockCreateObjectURL.mockReturnValue('blob:mock-url');

    const testData = [
      {
        employee_name: 'Alice Johnson',
        travel_type: 'domestic',
        destination: 'Chennai',
        amount: '₹12,500'
      }
    ];

    const options = {
      headers: ['Employee Name', 'Travel Type', 'Destination', 'Amount'],
      data: testData,
      title: 'Failed Export Test'
    };

    // Simulate script load failure
    setTimeout(() => {
      mockScript.onerror();
    }, 0);

    await exportData(options);

    expect(mockCreateElement).toHaveBeenCalledTimes(2); // Script + Link
    expect(global.Blob).toHaveBeenCalledWith(
      [expect.stringContaining('Employee Name,Travel Type,Destination,Amount')],
      { type: 'text/csv;charset=utf-8;' }
    );
    expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'travel-data.csv');
    expect(mockClick).toHaveBeenCalled();
  });

  // Test Case 3: Data Transformation and Travel Type Handling
  test('should properly transform travel_type values and handle currency formatting', async () => {
    (window as any).XLSX = mockXLSX;

    const testData = [
      {
        employee_name: 'Bob Wilson',
        travel_type: 'domestic',
        amount: ' ₹25,000',
        destination: 'Bangalore'
      },
      {
        employee_name: 'Carol Brown',
        travel_type: 'international',
        amount: ' ₹125,000',
        destination: 'London'
      },
      {
        employee_name: 'David Lee',
        travel_type: 'unknown_type',
        amount: 'N/A',
        destination: 'Delhi'
      }
    ];

    const options = {
      headers: ['Employee Name', 'Travel Type', 'Amount', 'Destination'],
      data: testData
    };

    await exportData(options);

    // Verify that aoa_to_sheet was called with properly transformed data
    expect(mockXLSX.utils.aoa_to_sheet).toHaveBeenCalledWith(
      expect.arrayContaining([
        ['Employee Name', 'Travel Type', 'Amount', 'Destination'],
        ['Bob Wilson', 'Domestic', ' ₹25,000', 'Bangalore'],
        ['Carol Brown', 'International', ' ₹125,000', 'London'],
        ['David Lee', 'unknown_type', 'N/A', 'Delhi']
      ])
    );
  });

  // Test Case 4: Empty Data and Missing Fields Handling
  test('should handle empty data and missing fields gracefully', async () => {
    (window as any).XLSX = mockXLSX;

    const testData = [
      {
        employee_name: 'Empty Test',
        // Missing travel_type and amount
        destination: 'Test City'
      },
      {
        // Completely empty object
      }
    ];

    const options = {
      headers: ['Employee Name', 'Travel Type', 'Destination', 'Amount'],
      data: testData,
      filename: 'empty-data-test'
    };

    await exportData(options);

    expect(mockXLSX.utils.aoa_to_sheet).toHaveBeenCalledWith(
      expect.arrayContaining([
        ['Employee Name', 'Travel Type', 'Destination', 'Amount'],
        ['Empty Test', 'Test City', 'Test City', ''],
        ['', 'Unknown', '', '']
      ])
    );
    expect(mockXLSX.writeFile).toHaveBeenCalledWith({}, 'empty-data-test.xlsx');
  });

  // Test Case 5: CSV Export with Special Characters and Escaping
  test('should properly escape special characters in CSV fallback', async () => {
    const mockScript = {
      onload: jest.fn(),
      onerror: jest.fn(),
    };
    const mockLink = {
      setAttribute: jest.fn(),
      style: { visibility: '' },
      click: mockClick,
    };

    mockCreateElement
      .mockReturnValueOnce(mockScript)
      .mockReturnValueOnce(mockLink);

    const testData = [
      {
        employee_name: 'Test, User',
        travel_type: 'domestic',
        destination: 'City "Special" Place',
        notes: 'Multi\nline\nnotes'
      },
      {
        employee_name: 'Quote"Test',
        travel_type: 'international',
        destination: 'Normal City',
        notes: null
      }
    ];

    const options = {
      headers: ['Employee Name', 'Travel Type', 'Destination', 'Notes'],
      data: testData,
      title: 'Special Characters Test',
      dateRange: 'Test Period: 2024'
    };

    // Force CSV fallback
    setTimeout(() => {
      mockScript.onerror();
    }, 0);

    await exportData(options);

    const expectedCsvContent = `Special Characters Test
Test Period: 2024

Employee Name,Travel Type,Destination,Notes
"Test, User",Domestic,"City ""Special"" Place","Multi
line
notes"
"Quote""Test",International,Normal City,
`;

    expect(global.Blob).toHaveBeenCalledWith(
      [expectedCsvContent],
      { type: 'text/csv;charset=utf-8;' }
    );
  });
});