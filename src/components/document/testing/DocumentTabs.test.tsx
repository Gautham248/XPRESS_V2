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

  // --- EXISTING TEST CASES ---
  test('should render all three tabs', () => {
    render(<DocumentTabs activeTab="Passport" setActiveTab={mockSetActiveTab} />);
    
    expect(screen.getByRole('button', { name: 'Passport' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Visa' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Aadhar' })).toBeInTheDocument();
  });

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

  test('should call setActiveTab with the correct document type when a tab is clicked', async () => {
    const user = userEvent.setup();
    render(<DocumentTabs activeTab="Passport" setActiveTab={mockSetActiveTab} />);
    
    const aadharTab = screen.getByRole('button', { name: 'Aadhar' });
    await user.click(aadharTab);

    expect(mockSetActiveTab).toHaveBeenCalledTimes(1);
    expect(mockSetActiveTab).toHaveBeenCalledWith('Aadhar');
  });

  // --- NEW TEST CASES ---

  // --- TEST CASE 4: Clicking the already active tab ---
  test('should call setActiveTab even when the active tab is clicked', async () => {
    const user = userEvent.setup();
    render(<DocumentTabs activeTab="Passport" setActiveTab={mockSetActiveTab} />);

    const passportTab = screen.getByRole('button', { name: 'Passport' });
    
    // The Passport tab is already active, we click it again
    await user.click(passportTab);

    // The handler should still be called
    expect(mockSetActiveTab).toHaveBeenCalledTimes(1);
    expect(mockSetActiveTab).toHaveBeenCalledWith('Passport');
  });

  // --- TEST CASE 5: Updates correctly on prop change ---
  test('should update active tab styles when activeTab prop changes', () => {
    // This test simulates a parent component changing the active tab.
    // `rerender` is used to pass new props to the same component.
    const { rerender } = render(
      <DocumentTabs activeTab="Passport" setActiveTab={mockSetActiveTab} />
    );

    // Initial state check
    expect(screen.getByRole('button', { name: 'Passport' })).toHaveClass('border-blue-600');
    expect(screen.getByRole('button', { name: 'Aadhar' })).toHaveClass('border-transparent');
    
    // Re-render the component with a new activeTab prop, as a parent would
    rerender(<DocumentTabs activeTab="Aadhar" setActiveTab={mockSetActiveTab} />);

    // Assert that the styles have updated correctly without any user click
    expect(screen.getByRole('button', { name: 'Passport' })).toHaveClass('border-transparent');
    expect(screen.getByRole('button', { name: 'Aadhar' })).toHaveClass('border-blue-600');
  });

  
});