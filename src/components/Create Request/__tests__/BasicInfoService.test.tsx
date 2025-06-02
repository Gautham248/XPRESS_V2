// import React from 'react';
// import { render, screen, fireEvent } from '@testing-library/react';
// import BasicInfoSection from '../BasicInfoSection';
// import { useTravelRequest } from '../TravelRequestContext';

// jest.mock('./TravelRequestContext', () => ({
//   useTravelRequest: jest.fn(),
// }));

// const mockedUseTravelRequest = useTravelRequest as jest.Mock;

// describe('BasicInfoSection', () => {
//   const dispatch = jest.fn();

//   beforeEach(() => {
//     dispatch.mockClear();
//     mockedUseTravelRequest.mockReset();
//   });

//   it('renders all travel and trip type buttons', () => {
//     mockedUseTravelRequest.mockReturnValue({
//       state: { travelType: '', tripType: '' },
//       dispatch,
//     });

//     render(<BasicInfoSection />);
//     expect(screen.getByText('Domestic')).toBeInTheDocument();
//     expect(screen.getByText('International')).toBeInTheDocument();
//     expect(screen.getByText('One Way')).toBeInTheDocument();
//     expect(screen.getByText('Round Trip')).toBeInTheDocument();
//   });

//   it('dispatches SET_TRAVEL_TYPE on travel button click', () => {
//     mockedUseTravelRequest.mockReturnValue({
//       state: { travelType: '', tripType: '' },
//       dispatch,
//     });

//     render(<BasicInfoSection />);
//     fireEvent.click(screen.getByText('Domestic'));
//     expect(dispatch).toHaveBeenCalledWith({ type: 'SET_TRAVEL_TYPE', payload: 'domestic' });

//     fireEvent.click(screen.getByText('International'));
//     expect(dispatch).toHaveBeenCalledWith({ type: 'SET_TRAVEL_TYPE', payload: 'international' });
//   });

//   it('dispatches SET_TRIP_TYPE on trip button click', () => {
//     mockedUseTravelRequest.mockReturnValue({
//       state: { travelType: '', tripType: '' },
//       dispatch,
//     });

//     render(<BasicInfoSection />);
//     fireEvent.click(screen.getByText('One Way'));
//     expect(dispatch).toHaveBeenCalledWith({ type: 'SET_TRIP_TYPE', payload: 'oneWay' });

//     fireEvent.click(screen.getByText('Round Trip'));
//     expect(dispatch).toHaveBeenCalledWith({ type: 'SET_TRIP_TYPE', payload: 'roundTrip' });
//   });
// });
