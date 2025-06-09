import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LocationSearch from '../LocationSearch';

// We only need a minimal mock for fetch to prevent network errors,
// even though we won't be testing the API call directly.
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([]),
  })
) as jest.Mock;


describe('LocationSearch Component', () => {
  const user = userEvent.setup();
  const onSelectMock = jest.fn();

  beforeEach(() => {
    // Clear any previous mock calls
    onSelectMock.mockClear();
  });

  // --- Test Case 1: Simple Render Test ---
  // This test is simple, stable, and confirms the component appears correctly.
  test('should render the input with the correct placeholder', () => {
    render(<LocationSearch onSelect={onSelectMock} placeholder="Find your city..." />);
    
    // Assert that the input field is on the screen.
    expect(screen.getByPlaceholderText('Find your city...')).toBeInTheDocument();
  });

  // --- Test Case 2: Basic User Interaction ---
  // This test confirms that the input is not disabled and the user can type in it,
  // which is a fundamental requirement.
  test('should update the input value as a user types', async () => {
    render(<LocationSearch onSelect={onSelectMock} />);
    
    const inputElement = screen.getByPlaceholderText(/type a city/i);
    
    // Act: Simulate a user typing into the input field.
    await user.type(inputElement, 'London');
    
    // Assert: The value of the input should now be "London".
    expect(inputElement).toHaveValue('London');
  });
});