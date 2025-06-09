// This file tests the pure functions from your context file.

// Make sure to export 'travelRequestReducer' and 'initialState' from your main context file.
import { travelRequestReducer, initialState } from '../TravelRequestContext';

describe('TravelRequest Reducer Logic', () => {

  // Test Case 1: A simple state update
  test('should correctly set the project code', () => {
    const action = { type: 'SET_PROJECT_CODE' as const, payload: 'PROJ-TEST-123' };
    const newState = travelRequestReducer(initialState, action);
    expect(newState.projectCode).toBe('PROJ-TEST-123');
  });

  // Test Case 2: Logic inside the reducer
  test('should set travelType to international and force transportMode to flight', () => {
    const stateWithTrain = { ...initialState, transportMode: 'train' };
    const action = { type: 'SET_TRAVEL_TYPE' as const, payload: 'international' as const };
    const newState = travelRequestReducer(stateWithTrain, action);
    
    expect(newState.travelType).toBe('international');
    expect(newState.transportMode).toBe('flight'); // This is the specific logic we're testing.
  });

  // Test Case 3: Logic that clears other parts of the state
  test('should clear return dates when tripType is set to oneWay', () => {
    const stateWithReturnDate = { ...initialState, returnDepartureDate: new Date() };
    const action = { type: 'SET_TRIP_TYPE' as const, payload: 'oneWay' as const };
    const newState = travelRequestReducer(stateWithReturnDate, action);

    expect(newState.tripType).toBe('oneWay');
    expect(newState.returnDepartureDate).toBeNull(); // This is the key assertion.
  });

  // Test Case 4: The reset action
  test('should reset the entire form state to the initial state', () => {
    // Create a "dirty" state
    const dirtyState = { 
      ...initialState, 
      reason: 'A test reason', 
      projectCode: 'SOME-CODE' 
    };
    const action = { type: 'RESET_FORM' as const };
    const newState = travelRequestReducer(dirtyState, action);

    // Assert that the new state is identical to the original initial state.
    expect(newState).toEqual(initialState);
  });
});