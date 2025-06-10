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

  // A helper object to map labels to placeholders, making tests more readable.
  const placeholders = {
    agency: 'Enter travel agency name',
    totalExpenses: '0.00',
    // Separate mode
    departureAirline: 'Enter departure airline name',
    returnAirline: 'Enter return airline name',
    // Same mode
    airline: 'Enter airline name',
  };

  describe('Rendering Logic', () => {
    it('should render separate departure and return fields when "same airlines" is unchecked', () => {
      const props = createTestProps({ closeRequestData: { sameAirlines: false } });
      render(<CloseRequestModalContent {...props} />);

      // FIX: Use getByPlaceholderText because labels are not associated with inputs.
      expect(screen.getByPlaceholderText(placeholders.agency)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(placeholders.departureAirline)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(placeholders.returnAirline)).toBeInTheDocument();

      // Check for the unified "Airline Name" field's absence.
      expect(screen.queryByPlaceholderText(placeholders.airline)).not.toBeInTheDocument();
    });

    it('should render a single airline field when "same airlines" is checked', () => {
      const props = createTestProps({ closeRequestData: { sameAirlines: true } });
      render(<CloseRequestModalContent {...props} />);
      
      // FIX: Use getByPlaceholderText.
      expect(screen.getByPlaceholderText(placeholders.airline)).toBeInTheDocument();

      // Ensure separate airline fields are NOT visible.
      expect(screen.queryByPlaceholderText(placeholders.departureAirline)).not.toBeInTheDocument();
      expect(screen.queryByPlaceholderText(placeholders.returnAirline)).not.toBeInTheDocument();
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

      // FIX: Use getByPlaceholderText to find inputs and then check their value.
      expect(screen.getByPlaceholderText(placeholders.agency)).toHaveValue('My Travel Co');
      expect(screen.getByPlaceholderText(placeholders.departureAirline)).toHaveValue('Indigo');
      expect(screen.getByPlaceholderText(placeholders.returnAirline)).toHaveValue('Vistara');

      // For number inputs with the same placeholder, we use getAllBy and check the value.
      // This is less robust but necessary given the component's HTML.
      expect(screen.getByDisplayValue('5000')).toBeInTheDocument();
      expect(screen.getByDisplayValue('6000')).toBeInTheDocument();
      expect(screen.getByDisplayValue('11000')).toBeInTheDocument();

      // The checkbox label works, so we can keep using it.
      expect(screen.getByLabelText(/Same airline/i)).not.toBeChecked();
    });
  });

  describe('User Interaction and Callbacks', () => {
    
    it('should call handleCloseRequestInputChange with the correct arguments for text inputs', async () => {
      const user = userEvent.setup();
      const mockHandler = jest.fn();
      const props = createTestProps({ handleCloseRequestInputChange: mockHandler });
      
      render(<CloseRequestModalContent {...props} />);
      
      // FIX: Use getByPlaceholderText to select the input.
      const travelAgencyInput = screen.getByPlaceholderText(placeholders.agency);
      await user.type(travelAgencyInput, 'New Agency');
      expect(mockHandler).toHaveBeenLastCalledWith('travelAgency', 'New Agency');
      
      const departureAirlineInput = screen.getByPlaceholderText(placeholders.departureAirline);
      await user.type(departureAirlineInput, 'Air India');
      expect(mockHandler).toHaveBeenLastCalledWith('departureAirline', 'Air India');
    });

    it('should call handleCloseRequestInputChange when the "same airlines" checkbox is clicked', async () => {
      const user = userEvent.setup();
      const mockHandler = jest.fn();
      const props = createTestProps({
        closeRequestData: { sameAirlines: false },
        handleCloseRequestInputChange: mockHandler,
      });

      render(<CloseRequestModalContent {...props} />);

      // This query works because the checkbox label IS correctly associated.
      const checkbox = screen.getByLabelText(/Same airline for departure and return/i);
      await user.click(checkbox);
      expect(mockHandler).toHaveBeenCalledWith('sameAirlines', true);
    });

    it('should call the correct handler when in "same airlines" mode', async () => {
        const user = userEvent.setup();
        const mockHandler = jest.fn();
        const props = createTestProps({
          closeRequestData: { sameAirlines: true },
          handleCloseRequestInputChange: mockHandler,
        });
  
        render(<CloseRequestModalContent {...props} />);

        // FIX: Use getByPlaceholderText to select the input.
        const airlineInput = screen.getByPlaceholderText(placeholders.airline);
        await user.type(airlineInput, 'SpiceJet');
        expect(mockHandler).toHaveBeenLastCalledWith('departureAirline', 'SpiceJet');

        // For the ambiguous cost input, we'll get them all and target the first one.
        const costInputs = screen.getAllByPlaceholderText(placeholders.totalExpenses); // "0.00" is the placeholder
        await user.type(costInputs[0], '8888');
        expect(mockHandler).toHaveBeenLastCalledWith('departureCost', '8888');
      });
  });
});