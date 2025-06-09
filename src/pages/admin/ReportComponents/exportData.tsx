interface ExportDataOptions {
  filename?: string;
  headers: string[];
  data: Record<string, any>[];
  title?: string;
  dateRange?: string;
}


const loadSheetJS = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    
    if (typeof window !== 'undefined' && (window as any).XLSX) {
      resolve((window as any).XLSX);
      return;
    }

    
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    script.onload = () => {
      if ((window as any).XLSX) {
        resolve((window as any).XLSX);
      } else {
        reject(new Error('Failed to load SheetJS library'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load SheetJS library'));
    document.head.appendChild(script);
  });
};

/**
 * Converts table data to Excel format and triggers download
 * @param options - Export configuration options
 */
export const exportData = async ({
  filename = 'travel-data',
  headers,
  data,
  title,
  dateRange
}: ExportDataOptions): Promise<void> => {
  try {
    console.log('Starting Excel export...');
    
  
    const XLSX = await loadSheetJS();
    console.log('SheetJS loaded successfully');
    
  
    const workbook = XLSX.utils.book_new();
    
    
    const worksheetData: any[][] = [];
  
    if (title) {
      worksheetData.push([title]);
      worksheetData.push([]);
    }
    
    if (dateRange) {
      worksheetData.push([dateRange]);
      worksheetData.push([]); 
    }
    
    // Add headers row
    worksheetData.push(headers);
    
    // Add data rows
    data.forEach(row => {
      const rowValues = headers.map(header => {
        // Convert header to key (same logic as ReusableTable)
        const key = header.toLowerCase().replace(/\s+/g, '_');
        let value = row[key] !== undefined ? row[key] : row[Object.keys(row)[headers.indexOf(header)]];
        
        // Special handling for travel_type to ensure proper capitalization
        if (key === 'travel_type') {
          if (value === 'domestic') return 'Domestic';
          if (value === 'international') return 'International';
          return value || 'Unknown';
        }
        
        // Clean up value formatting for Excel
        if (typeof value === 'string' && value.startsWith(' ₹')) {
          // Convert currency strings to numbers for better Excel formatting
          const numericValue = value.replace(/[$,]/g, '');
          const parsedValue = parseFloat(numericValue);
          return isNaN(parsedValue) ? value : parsedValue;
        }
        
        return value || '';
      });
      
      worksheetData.push(rowValues);
    });

    console.log('Worksheet data prepared:', worksheetData);

    // Create worksheet from data
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Set column widths for better formatting
    const columnWidths = headers.map(header => {
      // Calculate optimal width based on header length and data
      const headerLength = header.length;
      const maxDataLength = Math.max(
        ...data.map(row => {
          const key = header.toLowerCase().replace(/\s+/g, '_');
          const value = row[key] !== undefined ? row[key] : row[Object.keys(row)[headers.indexOf(header)]];
          // Handle travel_type specifically for width calculation
          if (key === 'travel_type') {
            return String(value === 'domestic' ? 'Domestic' : value === 'international' ? 'International' : value || 'Unknown').length;
          }
          return String(value || '').length;
        })
      );
      
      return { wch: Math.max(headerLength, maxDataLength, 10) + 2 };
    });
    
    worksheet['!cols'] = columnWidths;
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Travel Data');
    
    console.log('Workbook created, generating Excel file...');
    
    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, `${filename}.xlsx`);
    
    console.log('Excel export completed successfully');
  } catch (error) {
    console.error('Excel export failed:', error);
    
    // Fallback to CSV if Excel export fails
    console.log('Falling back to CSV export...');
    exportAsCSVFallback({ filename, headers, data, title, dateRange });
  }
};

/**
 * Fallback CSV export function in case Excel export fails
 * @param options - Export configuration options
 */
const exportAsCSVFallback = ({
  filename = 'travel-data',
  headers,
  data,
  title,
  dateRange
}: ExportDataOptions): void => {
  try {
    console.log('Starting CSV fallback export...');
    
    let csvContent = '';
    
    // Add title and date range as header comments if provided
    if (title) {
      csvContent += `${title}\n`;
    }
    if (dateRange) {
      csvContent += `${dateRange}\n`;
    }
    if (title || dateRange) {
      csvContent += '\n'; // Add blank line after header comments
    }

    // Add headers
    csvContent += headers.join(',') + '\n';

    // Add data rows
    data.forEach(row => {
      const rowValues = headers.map(header => {
        const key = header.toLowerCase().replace(/\s+/g, '_');
        let value = row[key] !== undefined ? row[key] : row[Object.keys(row)[headers.indexOf(header)]];
        
        // Special handling for travel_type to ensure proper capitalization
        if (key === 'travel_type') {
          if (value === 'domestic') return 'Domestic';
          if (value === 'international') return 'International';
          return value || 'Unknown';
        }
        
        // Handle different value types
        if (value === null || value === undefined) {
          value = '';
        } else if (typeof value === 'string') {
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            value = '"' + value.replace(/"/g, '""') + '"';
          }
        }
        
        return value;
      });
      
      csvContent += rowValues.join(',') + '\n';
    });

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('CSV fallback export completed successfully');
  } catch (error) {
    console.error('CSV fallback export also failed:', error);
    alert('Export failed. Please try again.');
  }
};