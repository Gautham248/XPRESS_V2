import React from 'react';
import { render, screen } from '@testing-library/react';
import TravelDetailsSection from '../TravelDetailsSection';

// --- Mocks for all dependencies ---
jest.mock('../TravelRequestContext', () => ({
  useTravelRequest: () => ({
    state: { travelType: 'domestic', tripType: 'oneWay' },
    dispatch: jest.fn(),
  }),
}));
jest.mock('../LocationSearch', () => () => <div data-testid="location-search-mock" />);
jest.mock('react-datepicker', () => () => <div data-testid="datepicker-mock" />);
jest.mock('react-select', () => () => <div data-testid="react-select-mock" />);

describe('TravelDetailsSection Component', () => {
  
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  test('should show loading state and then display project codes on successful fetch', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ['PROJ-001'],
    });
    render(<TravelDetailsSection />);
    expect(screen.getByText(/Loading project codes.../i)).toBeInTheDocument();
    expect(await screen.findByTestId('react-select-mock')).toBeInTheDocument();
  });

  test('should show an error message if project codes fetch fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Arrange
    // THE FIX IS HERE: Changed jest.mock to jest.Mock
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));
    
    render(<TravelDetailsSection />);

    // Assert
    expect(await screen.findByText(/Failed to load project codes/i)).toBeInTheDocument();
    
    consoleErrorSpy.mockRestore();
  });
});