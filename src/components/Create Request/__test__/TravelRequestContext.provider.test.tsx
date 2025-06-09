import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TravelRequestProvider, useTravelRequest } from '../TravelRequestContext';
import { travelRequestService } from '../TravelRequestService';

// --- Mock the external service ---
// We still need this to confirm it IS NOT called on a failed validation.
jest.mock('../TravelRequestService', () => ({
  travelRequestService: {
    submitTravelRequest: jest.fn(),
  },
}));
const mockedSubmit = travelRequestService.submitTravelRequest as jest.Mock;

// --- A VERY Simple Test Consumer ---
// Its only job is to provide a submit button and show an error.
const SubmitConsumer: React.FC = () => {
  const { handleSubmit, submitError } = useTravelRequest();
  
  return (
    <form onSubmit={handleSubmit}>
      {submitError && <p role="alert">{submitError}</p>}
      <button type="submit">Submit</button>
    </form>
  );
};

describe('TravelRequestProvider', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    // Reset mocks before each test
    mockedSubmit.mockClear();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  // --- The ONLY Test Case ---
  test('should fail submission and show a validation error if the form is empty', async () => {
    // Arrange: Render the provider with our simple consumer.
    // The form starts in its default, invalid state.
    render(
      <TravelRequestProvider>
        <SubmitConsumer />
      </TravelRequestProvider>
    );
    
    // Act: Click the submit button immediately.
    await user.click(screen.getByRole('button', { name: /submit/i }));

    // Assert: Check that the correct validation error appears.
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/Please select a valid source location/i);
    
    // Assert: CRUCIALLY, confirm that the API was never called.
    expect(mockedSubmit).not.toHaveBeenCalled();
  });
});