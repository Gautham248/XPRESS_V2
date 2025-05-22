import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DataTable from '../DataTable';

// Mock data
const mockData = [
  { id: '1', name: 'John Doe', status: 'Active', type: 'Employee' },
  { id: '2', name: 'Jane Smith', status: 'Inactive', type: 'Contractor' },
];

const headers = [
  { key: 'id', displayName: 'ID' },
  { key: 'name', displayName: 'Name', sortable: true },
  { key: 'status', displayName: 'Status' },
  { key: 'type', displayName: 'Type' },
];

const getStatusColor = (status: string) => {
  return status === 'Active' ? 'bg-green-100' : 'bg-red-100';
};

const renderDataTable = (props = {}) => {
  return render(
    <BrowserRouter>
      <DataTable
        headers={headers}
        data={mockData}
        title="Test Table"
        searchableFields={['name', 'status']}
        statusOptions={['Active', 'Inactive']}
        typeOptions={['Employee', 'Contractor']}
        getStatusColor={getStatusColor}
        {...props}
      />
    </BrowserRouter>
  );
};

describe('DataTable Component', () => {
  it('renders table with correct headers', () => {
    renderDataTable();
    headers.forEach(header => {
      expect(screen.getByText(header.displayName)).toBeInTheDocument();
    });
  });

  it('renders data rows correctly', () => {
    renderDataTable();
    mockData.forEach(item => {
      expect(screen.getByText(item.name)).toBeInTheDocument();
      expect(screen.getByText(item.status)).toBeInTheDocument();
    });
  });

  it('filters data based on search term', () => {
    renderDataTable();
    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'John' } });
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
  });

  it('filters data based on status', () => {
    renderDataTable();
    const statusFilter = screen.getByText('All');
    fireEvent.click(statusFilter);
    fireEvent.click(screen.getByText('Active'));

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
  });

  it('applies correct status color', () => {
    renderDataTable();
    const activeStatus = screen.getByText('Active');
    const inactiveStatus = screen.getByText('Inactive');

    expect(activeStatus.closest('div')).toHaveClass('bg-green-100');
    expect(inactiveStatus.closest('div')).toHaveClass('bg-red-100');
  });

  it('handles row click when provided', () => {
    const onRowClick = jest.fn();
    renderDataTable({ onRowClick });
    
    fireEvent.click(screen.getByText('John Doe'));
    expect(onRowClick).toHaveBeenCalledWith(mockData[0]);
  });

  it('handles column visibility toggle', () => {
    renderDataTable();
    const columnToggle = screen.getByText('Columns');
    fireEvent.click(columnToggle);
    
    const nameColumn = screen.getByLabelText('Name');
    fireEvent.click(nameColumn);
    
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  it('persists column visibility in localStorage', () => {
    renderDataTable();
    const columnToggle = screen.getByText('Columns');
    fireEvent.click(columnToggle);
    
    const nameColumn = screen.getByLabelText('Name');
    fireEvent.click(nameColumn);
    
    const savedColumns = JSON.parse(localStorage.getItem('Test TableColumns') || '[]');
    expect(savedColumns).not.toContain('name');
  });
});