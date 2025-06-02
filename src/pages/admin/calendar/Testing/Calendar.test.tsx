// src/pages/admin/calendar/Testing/Calendar.test.tsx

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';


import Calendar, { TravelRequest } from '../Calendar';

jest.mock('../DatePicker', () => (props: any) => (
  <div data-testid="datepicker">
    Mock DatePicker - View: {props.view} - Date: {props.currentDate.toISOString().split('T')[0]}
    <button onClick={() => props.onDateSelect(5, 0, props.currentDate.getFullYear())}>Select Day 5</button>
  </div>
));
jest.mock('../WeekView', () => (props: any) => (
  <div data-testid="weekview">
    Mock WeekView - Date: {props.currentDate.toISOString().split('T')[0]}
    {props.selectedDate && <div data-testid="weekview-selected">Selected: {props.selectedDate.toISOString().split('T')[0]}</div>}
    <button onClick={() => {
        const currentDate = props.currentDate;
       
        const OriginalDate = (global as any).originalDateConstructor || Date;
        const nextDayTimestamp = OriginalDate.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate() + 1);
        props.setSelectedDate(new OriginalDate(nextDayTimestamp));
      }}
    >
      Select Next Day in WeekView
    </button>
  </div>
));


jest.mock('../MonthView', () => (props: any) => (
  <div data-testid="monthview">
    Mock MonthView - Date: {props.currentDate.toISOString().split('T')[0]}
    {props.selectedDate && <div data-testid="monthview-selected">Selected: {props.selectedDate.toISOString().split('T')[0]}</div>}
  </div>
));

jest.mock('../EventSidebar', () => (props: any) => (
  <div data-testid="eventsidebar">
    Mock EventSidebar
    {props.selectedDate && <div data-testid="sidebar-selected">Selected: {props.selectedDate.toISOString().split('T')[0]}</div>}
  </div>
));

jest.mock('../ViewToggle', () => (props: any) => (
  <div data-testid="viewtoggle">
    Mock ViewToggle - Current View: {props.view}
    <button onClick={() => props.onViewChange('Month')}>Set Month View</button>
    <button onClick={() => props.onViewChange('Week')}>Set Week View</button>
  </div>
));



// --- Mocks ---
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));


// Simpler Date Mocking
let originalDateNow: (() => number) | undefined;
let originalDateConstructor: (typeof Date) | undefined;

const mockCurrentTime = (isoDateTimeString: string) => {
  const mockTimestamp = new Date(isoDateTimeString).getTime();

  originalDateNow = Date.now;
  global.Date.now = jest.fn(() => mockTimestamp);

  originalDateConstructor = global.Date;
  (global as any).originalDateConstructor = originalDateConstructor; // Store for access in mocks

  const newDateMock = jest.fn((...args: any[]) => {
    if (args.length === 0) {
      return new originalDateConstructor!(mockTimestamp); // `new Date()` returns mocked time
    }
    return new originalDateConstructor!(...args); // `new Date(value)` uses original
  }) as any;

  // Preserve static methods
  Object.keys(originalDateConstructor!).forEach(key => {
    if (typeof (originalDateConstructor as any)[key] === 'function') {
      (newDateMock as any)[key] = (originalDateConstructor as any)[key];
    }
  });
  global.Date = newDateMock;
};


// --- Test Suite ---
describe('Calendar Component', () => {
  beforeEach(() => { // Moved Date mock setup to beforeEach
    mockCurrentTime('2023-10-26T00:00:00.000Z');
    mockedAxios.get.mockResolvedValue({ data: [] });
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Should clear jest.fn() mocks like Date.now and the Date constructor mock
    if (originalDateConstructor) {
      global.Date = originalDateConstructor;
      (global as any).originalDateConstructor = undefined;
    }
     
  });


  test('renders the title and initial loading state', () => {
    mockedAxios.get.mockImplementationOnce(() => new Promise(() => {}));
    render(<Calendar />);
    expect(screen.getByText('Travel Calendar')).toBeInTheDocument();
    expect(screen.getByText('Loading travel requests...')).toBeInTheDocument();
    expect(screen.queryByTestId('datepicker')).not.toBeInTheDocument(); // Should NOT be there
  });

  test('fetches and displays travel requests, defaulting to WeekView', async () => {
    const mockData: TravelRequest[] = [
      { requestId: 1, departureDate: '2023-10-28T00:00:00Z', returnDate: '2023-10-30T00:00:00Z', employeeName: 'John Doe', sourcePlace: 'CityA', sourceCountry: 'CountryA', destinationPlace: 'CityB', destinationCountry: 'CountryB', currentStatusName: 'Pending' },
    ];
    mockedAxios.get.mockResolvedValueOnce({ data: mockData });
    render(<Calendar />);
    await waitFor(() => {
      expect(screen.queryByText('Loading travel requests...')).not.toBeInTheDocument();
    });
    expect(screen.getByTestId('weekview')).toBeInTheDocument();
    expect(screen.queryByTestId('monthview')).not.toBeInTheDocument();
    expect(screen.getByTestId('eventsidebar')).toBeInTheDocument();
    expect(screen.getByTestId('datepicker')).toBeInTheDocument(); // Now it should be there
    expect(screen.getByTestId('viewtoggle')).toBeInTheDocument();
    expect(screen.getByTestId('datepicker')).toHaveTextContent('Date: 2023-10-26');
    await waitFor(() => {
        expect(screen.getByTestId('weekview-selected')).toHaveTextContent('Selected: 2023-10-26');
        expect(screen.getByTestId('sidebar-selected')).toHaveTextContent('Selected: 2023-10-26');
    });
  });

  test('displays an error message if fetching travel requests fails', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));
    render(<Calendar />);
    await waitFor(() => {
      expect(screen.queryByText('Loading travel requests...')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Failed to load travel requests. Please try again later.')).toBeInTheDocument();
  });

  test('switches between Week and Month views using ViewToggle', async () => {
    render(<Calendar />);
    await waitFor(() => expect(screen.queryByText('Loading travel requests...')).not.toBeInTheDocument());
    expect(screen.getByTestId('weekview')).toBeInTheDocument();
    expect(screen.getByTestId('viewtoggle')).toHaveTextContent('Current View: Week');
    const switchToMonthButton = screen.getByRole('button', { name: 'Set Month View' });
    fireEvent.click(switchToMonthButton);
    expect(screen.getByTestId('monthview')).toBeInTheDocument();
    expect(screen.queryByTestId('weekview')).not.toBeInTheDocument();
    expect(screen.getByTestId('viewtoggle')).toHaveTextContent('Current View: Month');
    const switchToWeekButton = screen.getByRole('button', { name: 'Set Week View' });
    fireEvent.click(switchToWeekButton);
    expect(screen.getByTestId('weekview')).toBeInTheDocument();
    expect(screen.queryByTestId('monthview')).not.toBeInTheDocument();
    expect(screen.getByTestId('viewtoggle')).toHaveTextContent('Current View: Week');
  });

  test('navigates to next and previous periods', async () => {
    render(<Calendar />);
    await waitFor(() => expect(screen.queryByText('Loading travel requests...')).not.toBeInTheDocument());
    const datePicker = screen.getByTestId('datepicker');
    expect(datePicker).toHaveTextContent('Date: 2023-10-26');
    const nextButton = screen.getByRole('button', { name: /next period/i }); 
    fireEvent.click(nextButton);
    await waitFor(() => expect(datePicker).toHaveTextContent('Date: 2023-11-02'));
    expect(screen.queryByTestId('weekview-selected')).not.toBeInTheDocument();
     const prevButton = screen.getByRole('button', { name: /previous period/i });
    fireEvent.click(prevButton);
    await waitFor(() => expect(datePicker).toHaveTextContent('Date: 2023-10-26'));
    fireEvent.click(prevButton);
    await waitFor(() => expect(datePicker).toHaveTextContent('Date: 2023-10-19'));
  });

  test('selecting a date in WeekView updates selectedDate', async () => {
    render(<Calendar />);
    await waitFor(() => expect(screen.queryByText('Loading travel requests...')).not.toBeInTheDocument());
    expect(screen.getByTestId('weekview-selected')).toHaveTextContent('Selected: 2023-10-26');
    expect(screen.getByTestId('sidebar-selected')).toHaveTextContent('Selected: 2023-10-26');
    const selectDayInWeekViewButton = screen.getByRole('button', {name: 'Select Next Day in WeekView'});
    fireEvent.click(selectDayInWeekViewButton);
    await waitFor(() => {
        expect(screen.getByTestId('weekview-selected')).toHaveTextContent('Selected: 2023-10-27');
        expect(screen.getByTestId('sidebar-selected')).toHaveTextContent('Selected: 2023-10-27');
    });
  });

});