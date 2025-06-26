import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CloseRequestModalContent from '../CloseRequestModalContent';

// The component's props interface, defined locally since it's not exported.
interface CloseRequestModalContentProps {
  closeRequestData: {
    travelAgency: string;
    sameAirlines: boolean;
    departureAirline: string;
    departureCost: string;
    returnAirline: string;
    returnCost: string;
    totalExpenses: string;
  };
  handleCloseRequestInputChange: (field: string, value: string | boolean) => void;
}

type TestPropsOverrides = {
  closeRequestData?: Partial<CloseRequestModalContentProps['closeRequestData']>;
  handleCloseRequestInputChange?: jest.Mock;
};

// Helper function to create default props for our tests.
const createTestProps = (overrides: TestPropsOverrides = {}): CloseRequestModalContentProps => {
  const defaultProps: CloseRequestModalContentProps = {
    closeRequestData: {
      travelAgency: '',
      sameAirlines: false,
      departureAirline: '',
      departureCost: '',
      returnAirline: '',
      returnCost: '',
      totalExpenses: '',
    },
    handleCloseRequestInputChange: jest.fn(),
  };

  return {
    ...defaultProps,
    closeRequestData: {
      ...defaultProps.closeRequestData,
      ...(overrides.closeRequestData || {}),
    },
    handleCloseRequestInputChange: overrides.handleCloseRequestInputChange || jest.fn(),
  };
};

describe('CloseRequestModalContent Component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const placeholders = {
    agency: 'Enter travel agency name',
    totalExpenses: '0.00',
    departureAirline: 'Enter departure airline name',
    returnAirline: 'Enter return airline name',
    airline: 'Enter airline name',
  };

  describe('Rendering Logic', () => {
    it('should render separate departure and return fields when "same airlines" is unchecked', () => {
      const props = createTestProps({ closeRequestData: { sameAirlines: false } });
      render(<CloseRequestModalContent {...props} />);
      expect(screen.getByPlaceholderText(placeholders.agency)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(placeholders.departureAirline)).toBeInTheDocument();
      expect(screen.queryByPlaceholderText(placeholders.airline)).not.toBeInTheDocument();
    });

    it('should render a single airline field when "same airlines" is checked', () => {
      const props = createTestProps({ closeRequestData: { sameAirlines: true } });
      render(<CloseRequestModalContent {...props} />);
      expect(screen.getByPlaceholderText(placeholders.airline)).toBeInTheDocument();
      expect(screen.queryByPlaceholderText(placeholders.departureAirline)).not.toBeInTheDocument();
    });

    it('should display the initial values from props correctly', () => {
      const props = createTestProps({
        closeRequestData: {
          travelAgency: 'My Travel Co',
          sameAirlines: false,
          departureAirline: 'Indigo',
          departureCost: '5000',
          returnAirline: 'Vistara',
          returnCost: '6000',
          totalExpenses: '11000',
        },
      });
      render(<CloseRequestModalContent {...props} />);
      expect(screen.getByPlaceholderText(placeholders.agency)).toHaveValue('My Travel Co');
      expect(screen.getByPlaceholderText(placeholders.departureAirline)).toHaveValue('Indigo');
      // A better way to find number inputs is by their value or label, not placeholder
      expect(screen.getByDisplayValue('5000')).toBeInTheDocument(); 
    });
  });

  describe('User Interaction and Callbacks', () => {
    it('should call handleCloseRequestInputChange with the correct arguments for text inputs', async () => {
      const user = userEvent.setup();
      const mockHandler = jest.fn();
      const props = createTestProps({ handleCloseRequestInputChange: mockHandler });

      render(<CloseRequestModalContent {...props} />);

      // Test Travel Agency input
      const travelAgencyInput = screen.getByPlaceholderText(placeholders.agency);
      await user.clear(travelAgencyInput);
      await user.type(travelAgencyInput, 'New Agency');

      // Use toHaveBeenLastCalledWith for a more robust and readable assertion
      expect(mockHandler).toHaveBeenLastCalledWith('travelAgency', 'New Agency');

      // Test Departure Airline input
      const departureAirlineInput = screen.getByPlaceholderText(placeholders.departureAirline);
      await user.clear(departureAirlineInput);
      await user.type(departureAirlineInput, 'Air India');
      
      expect(mockHandler).toHaveBeenLastCalledWith('departureAirline', 'Air India');
    });

    it('should call handleCloseRequestInputChange with the correct arguments for number inputs', async () => {
      const user = userEvent.setup();
      const mockHandler = jest.fn();
      const props = createTestProps({ handleCloseRequestInputChange: mockHandler });

      render(<CloseRequestModalContent {...props} />);
      
      // Select the input using its label. This is the recommended approach.
      // The 'i' flag makes the regex case-insensitive.
      const departureCostInput = screen.getByLabelText(/departure cost/i);

      await user.clear(departureCostInput);
      await user.type(departureCostInput, '12345');
      
      expect(mockHandler).toHaveBeenLastCalledWith('departureCost', '12345');
    });

    it('should call handleCloseRequestInputChange when the "same airlines" checkbox is clicked', async () => {
      const user = userEvent.setup();
      const mockHandler = jest.fn();
      const props = createTestProps({
        closeRequestData: { sameAirlines: false },
        handleCloseRequestInputChange: mockHandler,
      });

      render(<CloseRequestModalContent {...props} />);
      const checkbox = screen.getByLabelText(/Same airline for departure and return/i);
      
      await user.click(checkbox);
      
      expect(mockHandler).toHaveBeenCalledWith('sameAirlines', true);
    });

    it('should call the correct handlers when in "same airlines" mode', async () => {
      const user = userEvent.setup();
      const mockHandler = jest.fn();
      const props = createTestProps({
        closeRequestData: { sameAirlines: true },
        handleCloseRequestInputChange: mockHandler,
      });

      render(<CloseRequestModalContent {...props} />);

      // Test the single airline input
      const airlineInput = screen.getByPlaceholderText(placeholders.airline);
      await user.clear(airlineInput);
      await user.type(airlineInput, 'SpiceJet');
      
      // When 'same airlines' is true, the component should update BOTH fields.
      // Asserting that both were called is more robust.
      expect(mockHandler).toHaveBeenCalledWith('departureAirline', 'SpiceJet');
      expect(mockHandler).toHaveBeenCalledWith('returnAirline', 'SpiceJet');

      // Test the single cost input
      // Find the cost input by its label. Assuming a generic "Cost" label in this mode.
      const costInput = screen.getByLabelText(/cost/i);
      await user.clear(costInput);
      await user.type(costInput, '8888');
      
      // A single cost input in this mode should update both departure and return costs.
      expect(mockHandler).toHaveBeenCalledWith('departureCost', '8888');
      expect(mockHandler).toHaveBeenCalledWith('returnCost', '8888');
    });
  });
});