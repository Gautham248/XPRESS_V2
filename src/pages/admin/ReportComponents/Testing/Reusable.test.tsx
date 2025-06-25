import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReusableTable from '../ReusableTable';

describe('ReusableTable', () => {
  const mockHeaders = ['Name', 'Age', 'Email'];
  const mockData = [
    { name: 'John Doe', age: 30, email: 'john@example.com' },
    { name: 'Jane Smith', age: 25, email: 'jane@example.com' },
    { name: 'Bob Johnson', age: 35, email: 'bob@example.com' }
  ];

  it('renders table with correct headers', () => {
    render(<ReusableTable headers={mockHeaders} data={mockData} />);
    
    mockHeaders.forEach(header => {
      expect(screen.getByText(header)).toBeInTheDocument();
    });
  });

  it('renders correct number of rows', () => {
    render(<ReusableTable headers={mockHeaders} data={mockData} />);
    
    // Should have 3 data rows plus 1 header row
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(4);
  });

  it('renders correct data in cells', () => {
    render(<ReusableTable headers={mockHeaders} data={mockData} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('handles empty data array', () => {
    render(<ReusableTable headers={mockHeaders} data={[]} />);
    
    // Should only have header row
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(1);
    
    // Headers should still be present
    mockHeaders.forEach(header => {
      expect(screen.getByText(header)).toBeInTheDocument();
    });
  });

  it('handles empty headers array', () => {
    render(<ReusableTable headers={[]} data={mockData} />);
    
    // Should only have data rows, no header cells
    const headerCells = screen.queryAllByRole('columnheader');
    expect(headerCells).toHaveLength(0);
  });
  
  it('handles data with extra properties not in headers', () => {
    const dataWithExtraProps = [
      { 
        name: 'John', 
        age: 30, 
        email: 'john@example.com',
        extraProp: 'should not appear',
        anotherExtra: 'also hidden'
      }
    ];

    render(<ReusableTable headers={mockHeaders} data={dataWithExtraProps} />);
    
    // Should show expected data
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    
    // Should not show extra properties
    expect(screen.queryByText('should not appear')).not.toBeInTheDocument();
    expect(screen.queryByText('also hidden')).not.toBeInTheDocument();
  });

  it('handles headers with special characters and spaces', () => {
    const specialHeaders = ['First Name', 'E-mail Address', 'Phone # (Mobile)'];
    const specialData = [
      { 
        'first_name': 'John',
        'e-mail_address': 'john@test.com',
        'phone_#_(mobile)': '555-1234'
      }
    ];

    render(<ReusableTable headers={specialHeaders} data={specialData} />);
    
    expect(screen.getByText('First Name')).toBeInTheDocument();
    expect(screen.getByText('E-mail Address')).toBeInTheDocument();
    expect(screen.getByText('Phone # (Mobile)')).toBeInTheDocument();
  });
});