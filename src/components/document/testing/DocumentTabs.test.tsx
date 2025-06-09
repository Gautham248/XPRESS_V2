// src/components/DocumentTabs.test.tsx

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import DocumentTabs from '../DocumentTabs';
import { DocumentType } from '../types';

describe('DocumentTabs Component', () => {

  // Create a mock function to simulate the parent's setActiveTab function
  const mockSetActiveTab = jest.fn();

  // Clear the mock's history before each test to ensure test isolation
  beforeEach(() => {
    mockSetActiveTab.mockClear();
  });

  // --- TEST CASE 1: Renders all tabs correctly ---
  test('should render all three tabs', () => {
    render(<DocumentTabs activeTab="Passport" setActiveTab={mockSetActiveTab} />);
    
    // Check that buttons for all document types are present in the document
    expect(screen.getByRole('button', { name: 'Passport' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Visa' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Aadhar' })).toBeInTheDocument();
  });

  // --- TEST CASE 2: Correctly applies active styles ---
  test('should highlight the active tab based on the activeTab prop', () => {
    // We will check the 'Visa' tab for this test
    const activeTab: DocumentType = 'Visa';
    render(<DocumentTabs activeTab={activeTab} setActiveTab={mockSetActiveTab} />);
    
    const passportTab = screen.getByRole('button', { name: 'Passport' });
    const visaTab = screen.getByRole('button', { name: 'Visa' });
    const aadharTab = screen.getByRole('button', { name: 'Aadhar' });

    // The active tab should have classes that make it visually distinct
    // We check for parts of the class names defined in the component
    expect(visaTab).toHaveClass('border-blue-600 text-blue-600');

    // The inactive tabs should have the default classes
    expect(passportTab).toHaveClass('border-transparent text-gray-500');
    expect(aadharTab).toHaveClass('border-transparent text-gray-500');
  });

  // --- TEST CASE 3: Calls the callback function on click ---
  test('should call setActiveTab with the correct document type when a tab is clicked', async () => {
    const user = userEvent.setup();
    render(<DocumentTabs activeTab="Passport" setActiveTab={mockSetActiveTab} />);
    
    // Find the 'Aadhar' tab button
    const aadharTab = screen.getByRole('button', { name: 'Aadhar' });

    // Simulate a user clicking the 'Aadhar' tab
    await user.click(aadharTab);

    // Verify that our mock function was called
    expect(mockSetActiveTab).toHaveBeenCalledTimes(1);

    // Verify that it was called with the correct argument
    expect(mockSetActiveTab).toHaveBeenCalledWith('Aadhar');
  });

});