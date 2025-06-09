import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Import the component to be tested.
import DatePicker from '../DatePicker'; 

describe('DatePicker Component', () => {

  const mockOnDateSelect = jest.fn();
  const mockFormatWeekRange = jest.fn(() => 'Oct 20 - Oct 26, 2024');

  const defaultProps = {
    currentDate: new Date('2024-10-22T12:00:00Z'), 
    onDateSelect: mockOnDateSelect,
    formatWeekRange: mockFormatWeekRange,
  };

  // Reset all mocks before each test to ensure test isolation
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('should render the button with the formatted month when view is "Month"', () => {
      render(<DatePicker {...defaultProps} view="Month" />);
      
      expect(screen.getByRole('button', { name: /October 2024/i })).toBeInTheDocument();
      expect(screen.queryByText('Jan')).not.toBeInTheDocument();
    });

    it('should render the button with the formatted week range when view is "Week"', () => {
      render(<DatePicker {...defaultProps} view="Week" />);
      
      expect(screen.getByRole('button', { name: /Oct 20 - Oct 26, 2024/i })).toBeInTheDocument();
      expect(mockFormatWeekRange).toHaveBeenCalled();
    });
  });

  describe('Picker Visibility and Interaction', () => {
    it('should open the month selection grid when the button is clicked', async () => {
      const user = userEvent.setup();
      render(<DatePicker {...defaultProps} view="Month" />);

      const pickerButton = screen.getByRole('button', { name: /October 2024/i });
      await user.click(pickerButton);

      expect(screen.getByRole('button', { name: '2024' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Jan' })).toBeInTheDocument();
    });

    it('should close the picker when clicking outside the component', async () => {
        const user = userEvent.setup();
        render(<DatePicker {...defaultProps} view="Month" />);

        const pickerButton = screen.getByRole('button', { name: /October 2024/i });
        await user.click(pickerButton);

        expect(screen.getByRole('button', { name: 'Jan' })).toBeInTheDocument();
        await user.click(document.body);
        expect(screen.queryByText('Jan')).not.toBeInTheDocument();
    });
  });

  describe('Selection Logic', () => {
    it('in "Month" view, should call onDateSelect with year/month and close when a month is clicked', async () => {
      const user = userEvent.setup();
      render(<DatePicker {...defaultProps} view="Month" />);
      
      await user.click(screen.getByRole('button', { name: /October 2024/i }));
      
      const mayButton = screen.getByRole('button', { name: 'May' });
      await user.click(mayButton);
      
      expect(mockOnDateSelect).toHaveBeenCalledWith(2024, 4); 
      expect(mockOnDateSelect).not.toHaveBeenCalledWith(expect.anything(), expect.anything(), expect.any(Number));
      expect(screen.queryByRole('button', { name: 'May' })).not.toBeInTheDocument();
    });

    it('in "Week" view, should navigate to day grid and then select a full date', async () => {
        const user = userEvent.setup();
        render(<DatePicker {...defaultProps} view="Week" />);
        
        await user.click(screen.getByRole('button'));
        await user.click(screen.getByRole('button', { name: 'Sep' }));
        
        expect(screen.getByRole('button', { name: 'September 2024' })).toBeInTheDocument();
        expect(screen.getByText('Sun')).toBeInTheDocument();
        
        const dayButton = screen.getByRole('button', { name: '15' });
        await user.click(dayButton);

        expect(mockOnDateSelect).toHaveBeenCalledWith(2024, 8, 15);
        expect(screen.queryByText('September 2024')).not.toBeInTheDocument();
    });
  });
  
  describe('Picker Navigation', () => {
    it('should navigate between years in the month grid', async () => {
        const user = userEvent.setup();
        render(<DatePicker {...defaultProps} view="Month" />);
        await user.click(screen.getByRole('button'));

        expect(screen.getByRole('button', { name: '2024' })).toBeInTheDocument();

        await user.click(screen.getByLabelText('Next year'));
        expect(screen.getByRole('button', { name: '2025' })).toBeInTheDocument();

        await user.click(screen.getByLabelText('Previous year'));
        await user.click(screen.getByLabelText('Previous year'));
        expect(screen.getByRole('button', { name: '2023' })).toBeInTheDocument();
    });
    
    it('should navigate between months in the day selection grid', async () => {
      const user = userEvent.setup();
      render(<DatePicker {...defaultProps} view="Week" />);
      
      await user.click(screen.getByRole('button'));
      await user.click(screen.getByRole('button', { name: 'Oct' }));

      expect(screen.getByRole('button', { name: 'October 2024' })).toBeInTheDocument();

      await user.click(screen.getByLabelText('Next month'));
      expect(screen.getByRole('button', { name: 'November 2024' })).toBeInTheDocument();

      const prevMonthButton = screen.getByLabelText('Previous month');
      await user.click(prevMonthButton);
      await user.click(prevMonthButton);
      expect(screen.getByRole('button', { name: 'September 2024' })).toBeInTheDocument();
    });

    it('should switch between Month, Year, and Day views correctly', async () => {
        const user = userEvent.setup();
        render(<DatePicker {...defaultProps} view="Week" />);
        await user.click(screen.getByRole('button'));

        expect(screen.getByText('Oct')).toBeInTheDocument();
        
        await user.click(screen.getByRole('button', { name: '2024' }));
        expect(screen.queryByText('Oct')).not.toBeInTheDocument();
        
    expect(screen.getByText('2019 - 2030')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: '2028' }));
        expect(screen.getByRole('button', { name: '2028' })).toBeInTheDocument();
        expect(screen.getByText('Jan')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'May' }));
        expect(screen.getByRole('button', { name: 'May 2028' })).toBeInTheDocument();
    });
  });

  describe('Day Grid Visual States', () => {
   beforeAll(() => {
      jest.useFakeTimers().setSystemTime(new Date('2024-10-15T12:00:00Z'));
    });
  
    afterAll(() => {
      // It's crucial to restore real timers after the tests in this block are done.
      jest.useRealTimers();
    });
  
    it('should correctly highlight the selected day and "today"', async () => {

      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      
      // In this test: Selected date is Oct 22 (from props), but "today" is mocked to be Oct 15.
      render(<DatePicker {...defaultProps} view="Week" />);
  
      // Open picker and navigate to the day view for October
      await user.click(screen.getByRole('button'));
      await user.click(screen.getByRole('button', { name: 'Oct' }));
  
      const selectedDayButton = screen.getByRole('button', { name: '22' });
      const todayButton = screen.getByRole('button', { name: '15' });
      const regularDayButton = screen.getByRole('button', { name: '10' });
  
      // Assert that the correct highlight classes are applied
      expect(selectedDayButton).toHaveClass('bg-blue-500 text-white');
      expect(todayButton).toHaveClass('bg-blue-100 text-blue-800');
      expect(regularDayButton).not.toHaveClass('bg-blue-500', 'bg-blue-100');
    });
  });

  describe('Prop Synchronization', () => {
    it('should update the picker display when currentDate prop changes', async () => {
        const user = userEvent.setup();
        const { rerender } = render(<DatePicker {...defaultProps} view="Month" />);
        
        const newDate = new Date('2028-05-15T12:00:00Z');
        rerender(<DatePicker {...defaultProps} currentDate={newDate} view="Month" />);
        
        await user.click(screen.getByRole('button', { name: /May 2028/i }));
        
        expect(screen.getByRole('button', { name: '2028' })).toBeInTheDocument();
        
        const mayButton = screen.getByRole('button', { name: 'May' });
        expect(mayButton).toHaveClass('bg-blue-500 text-white');
    });
  });
});