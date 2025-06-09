import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateRequestForm from '../CreateRequestForm';

// --- Mock 1: react-router-dom ---
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// --- Mock 2: The TravelRequestContext ---
const mockHandleSubmit = jest.fn((e) => {
  e.preventDefault();
});
// FIX: Corrected path from './' to '../'
jest.mock('../TravelRequestContext', () => ({
  useTravelRequest: () => ({
    handleSubmit: mockHandleSubmit,
  }),
}));

// --- Mock 3: Child Components ---
jest.mock('../BasicInfoSection', () => () => <div data-testid="basic-info-mock" />);
jest.mock('../TravelDetailsSection', () => () => <div data-testid="travel-details-mock" />);
jest.mock('../AdditionalServicesSection', () => () => <div data-testid="additional-services-mock" />);


describe('CreateRequestForm Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    mockNavigate.mockClear();
    mockHandleSubmit.mockClear();
  });

  test('should render all child sections and action buttons', () => {
    render(<CreateRequestForm />);
    expect(screen.getByTestId('basic-info-mock')).toBeInTheDocument();
    expect(screen.getByTestId('travel-details-mock')).toBeInTheDocument();
    expect(screen.getByTestId('additional-services-mock')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit request/i })).toBeInTheDocument();
  });

  test('should call navigate with -1 when the Cancel button is clicked', async () => {
    render(<CreateRequestForm />);
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  test('should call handleSubmit from the context when the form is submitted', async () => {
    render(<CreateRequestForm />);
    const submitButton = screen.getByRole('button', { name: /submit request/i });
    await user.click(submitButton);
    expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
  });
});