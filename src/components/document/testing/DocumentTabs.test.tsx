// src/components/DocumentTabs.test.tsx

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import DocumentTabs from '../DocumentTabs';
import { DocumentType } from '../types';

describe('DocumentTabs Component', () => {

  const mockSetActiveTab = jest.fn();

  beforeEach(() => {
    mockSetActiveTab.mockClear();
  });

  // --- TEST CASE 1: Renders all tabs correctly ---
  test('should render all three tabs', () => {
    render(<DocumentTabs activeTab="Passport" setActiveTab={mockSetActiveTab} />);
    
    expect(screen.getByRole('button', { name: 'Passport' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Visa' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Aadhar' })).toBeInTheDocument();
  });

  // --- TEST CASE 2: Correctly applies active styles ---
  test('should highlight the active tab based on the activeTab prop', () => {
    const activeTab: DocumentType = 'Visa';
    render(<DocumentTabs activeTab={activeTab} setActiveTab={mockSetActiveTab} />);
    
    const passportTab = screen.getByRole('button', { name: 'Passport' });
    const visaTab = screen.getByRole('button', { name: 'Visa' });
    const aadharTab = screen.getByRole('button', { name: 'Aadhar' });

    expect(visaTab).toHaveClass('border-blue-600 text-blue-600');

    expect(passportTab).toHaveClass('border-transparent text-gray-500');
    expect(aadharTab).toHaveClass('border-transparent text-gray-500');
  });

  // --- TEST CASE 3: Calls the callback function on click ---
  test('should call setActiveTab with the correct document type when a tab is clicked', async () => {
    const user = userEvent.setup();
    render(<DocumentTabs activeTab="Passport" setActiveTab={mockSetActiveTab} />);
    
    const aadharTab = screen.getByRole('button', { name: 'Aadhar' });

    await user.click(aadharTab);

    expect(mockSetActiveTab).toHaveBeenCalledTimes(1);

    expect(mockSetActiveTab).toHaveBeenCalledWith('Aadhar');
  });

});