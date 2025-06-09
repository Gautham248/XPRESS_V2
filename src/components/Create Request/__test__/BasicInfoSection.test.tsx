import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BasicInfoSection from '../BasicInfoSection';
import { useTravelRequest } from '../TravelRequestContext';

// Tell Jest to use a mock implementation for the TravelRequestContext module.
jest.mock('../TravelRequestContext', () => ({
  // The module exports a hook named 'useTravelRequest', so our mock must too.
  useTravelRequest: jest.fn(),
}));

// Cast the mocked hook to a Jest Mock type for type safety and autocompletion.
const mockedUseTravelRequest = useTravelRequest as jest.Mock;

describe('BasicInfoSection Component', () => {
  // We'll declare our mock dispatch function here with its type.
  let mockDispatch: jest.Mock;

  // Before each test, we reset our mocks to ensure test isolation.
  beforeEach(() => {
    mockDispatch = jest.fn();
    mockedUseTravelRequest.mockClear();
  });

  // --- Test Case 1: Initial Render ---
  test('should render correctly with default state highlighting active options', () => {
    // Arrange: Define the state our mock hook will return for this specific test.
    mockedUseTravelRequest.mockReturnValue({
      state: { travelType: 'domestic', tripType: 'oneWay' },
      dispatch: mockDispatch,
    });

    // Act: Render the component, which will now use our mocked context values.
    render(<BasicInfoSection />);

    // Assert: Verify that the UI reflects the mocked state.
    // The selected icons should be present for the active options.
    expect(screen.getByTestId('selected-icon-domestic')).toBeInTheDocument();
    expect(screen.getByTestId('selected-icon-one-way')).toBeInTheDocument();
    
    // The other icons should NOT be in the document. `queryBy` is used because
    // it returns null instead of throwing an error if the element is not found.
    expect(screen.queryByTestId('selected-icon-international')).not.toBeInTheDocument();
    expect(screen.queryByTestId('selected-icon-round-trip')).not.toBeInTheDocument();
  });

  // --- Test Case 2: User Interaction (Travel Type) ---
  test('should call dispatch with SET_TRAVEL_TYPE when the international button is clicked', async () => {
    const user = userEvent.setup();
    // Arrange: Set the initial state.
    mockedUseTravelRequest.mockReturnValue({
      state: { travelType: 'domestic', tripType: 'oneWay' },
      dispatch: mockDispatch,
    });
    render(<BasicInfoSection />);

    // Act: Find and click the "International" button.
    const internationalButton = screen.getByRole('button', { name: /international/i });
    await user.click(internationalButton);

    // Assert: Verify that dispatch was called once with the correct action object.
    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_TRAVEL_TYPE',
      payload: 'international',
    });
  });

  // --- Test Case 3: User Interaction (Trip Type) ---
  test('should call dispatch with SET_TRIP_TYPE when the round trip button is clicked', async () => {
    const user = userEvent.setup();
    // Arrange: Set the initial state.
    mockedUseTravelRequest.mockReturnValue({
      state: { travelType: 'domestic', tripType: 'oneWay' },
      dispatch: mockDispatch,
    });
    render(<BasicInfoSection />);

    // Act: Find and click the "Round Trip" button.
    const roundTripButton = screen.getByRole('button', { name: /round trip/i });
    await user.click(roundTripButton);

    // Assert: Verify that dispatch was called with the correct action.
    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_TRIP_TYPE',
      payload: 'roundTrip',
    });
  });

  // --- Test Case 4: Alternative Initial State ---
  test('should render correctly when initial context state is international and round trip', () => {
    // Arrange: Provide a different initial state to ensure the component is truly dynamic.
    mockedUseTravelRequest.mockReturnValue({
      state: { travelType: 'international', tripType: 'roundTrip' },
      dispatch: mockDispatch,
    });

    // Act: Render the component.
    render(<BasicInfoSection />);

    // Assert: Verify the UI reflects this different state.
    expect(screen.getByTestId('selected-icon-international')).toBeInTheDocument();
    expect(screen.getByTestId('selected-icon-round-trip')).toBeInTheDocument();

    expect(screen.queryByTestId('selected-icon-domestic')).not.toBeInTheDocument();
    expect(screen.queryByTestId('selected-icon-one-way')).not.toBeInTheDocument();
  });
});