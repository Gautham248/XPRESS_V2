import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdditionalServicesSection from '../AdditionalServicesSection';
import { useTravelRequest } from '../TravelRequestContext';

// --- Mock 1: The Context Hook ---
jest.mock('../TravelRequestContext', () => ({
  useTravelRequest: jest.fn(),
}));

// --- Mock 2: The Child Component ---
interface MockLocationSearchProps {
  onSelect: (location: { custom: boolean; label: string }) => void;
  placeholder: string;
  initialValue?: string;
}

jest.mock('../LocationSearch', () => {
  const MockLocationSearch = ({ onSelect, placeholder, initialValue }: MockLocationSearchProps) => (
    <div>
      <input
        data-testid={`location-search-${placeholder.includes('pickup') ? 'pickup' : 'dropoff'}`}
        placeholder={placeholder}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && onSelect) {
            onSelect({ custom: true, label: (e.target as HTMLInputElement).value });
          }
        }}
        defaultValue={initialValue || ''}
      />
    </div>
  );

  return {
    __esModule: true,
    default: MockLocationSearch,
  };
});

// Cast the mocked hook for type safety
const mockedUseTravelRequest = useTravelRequest as jest.Mock;

describe('AdditionalServicesSection Component', () => {
  let mockDispatch: jest.Mock;
  const user = userEvent.setup();

  const getInitialState = (overrides = {}) => ({
    requiresAccommodation: false,
    requiresPickup: false,
    requiresDropoff: false,
    pickupLocation: null,
    dropoffLocation: null,
    requiresFoodPreference: false,
    foodPreference: null,
    foodPreferenceComment: null,
    source: null,
    ...overrides,
  });

  beforeEach(() => {
    mockDispatch = jest.fn();
    mockedUseTravelRequest.mockClear();
  });

  // --- Test Case 1: Initial Render ---
  test('should render with all options off by default', () => {
    mockedUseTravelRequest.mockReturnValue({ state: getInitialState(), dispatch: mockDispatch });
    render(<AdditionalServicesSection />);

    expect(screen.getByLabelText(/Requires Accommodation/i)).not.toBeChecked();
    expect(screen.getByLabelText(/Requires Pickup/i)).not.toBeChecked();
    expect(screen.getByLabelText(/Requires Drop-off/i)).not.toBeChecked();
    expect(screen.getByLabelText(/Food Preference Required/i)).not.toBeChecked();

    // Verify conditional sections are NOT visible
    expect(screen.queryByPlaceholderText(/Search for pickup location/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Vegetarian/i)).not.toBeInTheDocument();
  });

  // --- Test Case 2: Conditional Rendering ---
  test('should show and hide the pickup location search when its checkbox is toggled', async () => {
    mockedUseTravelRequest.mockReturnValue({ state: getInitialState(), dispatch: mockDispatch });
    const { rerender } = render(<AdditionalServicesSection />);
    
    await user.click(screen.getByLabelText(/Requires Pickup/i));
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'SET_REQUIRES_PICKUP', payload: true });
    
    mockedUseTravelRequest.mockReturnValue({ state: getInitialState({ requiresPickup: true }), dispatch: mockDispatch });
    rerender(<AdditionalServicesSection />);
    expect(screen.getByPlaceholderText(/Search for pickup location/i)).toBeInTheDocument();
  });

  // --- Test Case 3: useEffect for Auto-populating Pickup ---
  test('should auto-populate pickup location from source when requiresPickup is checked', () => {
    const sourceLocation = { city: 'New York', state: 'NY', country: 'USA', label: 'New York, NY, USA' };
    const state = getInitialState({ requiresPickup: true, source: sourceLocation });
    mockedUseTravelRequest.mockReturnValue({ state, dispatch: mockDispatch });
    
    render(<AdditionalServicesSection />);

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_PICKUP_LOCATION',
      payload: 'New York, NY, USA',
    });
  });

  // --- Test Case 4: User Interaction with Mocked Child Component ---
  test('should dispatch SET_DROPOFF_LOCATION when a location is selected', async () => {
    const state = getInitialState({ requiresDropoff: true });
    mockedUseTravelRequest.mockReturnValue({ state, dispatch: mockDispatch });
    const { rerender } = render(<AdditionalServicesSection />);

    const dropoffInput = screen.getByTestId('location-search-dropoff');
    const newLocation = 'Eiffel Tower, Paris, France';

    await user.type(dropoffInput, `${newLocation}{enter}`);
    
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_DROPOFF_LOCATION',
      payload: newLocation,
    });

    const updatedState = { ...state, dropoffLocation: newLocation };
    mockedUseTravelRequest.mockReturnValue({ state: updatedState, dispatch: mockDispatch });
    rerender(<AdditionalServicesSection />);
    
    expect(screen.getByText(newLocation)).toBeInTheDocument();
  });
});