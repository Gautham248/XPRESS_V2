// // EventCard.test.tsx
// import React from 'react';
// import { render, screen, fireEvent } from '@testing-library/react';
// import '@testing-library/jest-dom';
// import EventCard from '../EventCard'; // Adjust path if necessary

// // Mock lucide-react icons to simplify testing and focus on the component logic
// jest.mock('lucide-react', () => ({
//   PlaneTakeoff: (props: any) => <div data-testid="plane-takeoff-icon" {...props} />,
//   Plane: (props: any) => <div data-testid="plane-icon" {...props} />,
// }));

// describe('EventCard', () => {
//   const mockOnClick = jest.fn();

//   beforeEach(() => {
//     // Clear mock call history before each test
//     mockOnClick.mockClear();
//   });

//   test('1. Renders "Departures" text and count for Departure type', () => {
//     render(<EventCard type="Departure" count={12} onClick={mockOnClick} />);
    
//     expect(screen.getByText('Departures')).toBeInTheDocument();
//     expect(screen.getByText('12')).toBeInTheDocument();
//   });

//   test('2. Renders "Returns" text and count for Return type', () => {
//     render(<EventCard type="Return" count={8} onClick={mockOnClick} />);
    
//     expect(screen.getByText('Returns')).toBeInTheDocument();
//     expect(screen.getByText('8')).toBeInTheDocument();
//   });

//   test('3. Calls onClick handler when a Departure card is clicked', () => {
//     render(<EventCard type="Departure" count={5} onClick={mockOnClick} />);
    
//     const cardElement = screen.getByText('Departures').closest('div'); // Get the main clickable div
//     if (cardElement) {
//       fireEvent.click(cardElement);
//     }
    
//     expect(mockOnClick).toHaveBeenCalledTimes(1);
//   });

//   test('4. Calls onClick handler when a Return card is clicked', () => {
//     render(<EventCard type="Return" count={3} onClick={mockOnClick} />);
    
//     const cardElement = screen.getByText('Returns').closest('div'); // Get the main clickable div
//     if (cardElement) {
//       fireEvent.click(cardElement);
//     }
    
//     expect(mockOnClick).toHaveBeenCalledTimes(1);
//   });

//   test('5. Renders PlaneTakeoff icon for Departure type', () => {
//     render(<EventCard type="Departure" count={1} onClick={mockOnClick} />);
    
//     expect(screen.getByTestId('plane-takeoff-icon')).toBeInTheDocument();
//     expect(screen.queryByTestId('plane-icon')).not.toBeInTheDocument();
//   });

//   test('6. Renders Plane icon for Return type', () => {
//     render(<EventCard type="Return" count={1} onClick={mockOnClick} />);
    
//     expect(screen.getByTestId('plane-icon')).toBeInTheDocument();
//     expect(screen.queryByTestId('plane-takeoff-icon')).not.toBeInTheDocument();
//     // Check for rotation class if critical (though the mock doesn't have it, so this would be a test of the mock if not careful)
//     // For a simple test, just checking presence is often enough.
//   });
// });
