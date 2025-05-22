import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TimelineModal from '../TimelineModal';

const mockTimeline = [
  {
    id: '1',
    status: 'Request Created',
    date: '2023-01-01',
    description: 'Travel request submitted',
    completed: true,
  },
  {
    id: '2',
    status: 'Manager Review',
    date: '2023-01-02',
    description: 'Pending manager approval',
    completed: false,
    active: true,
  },
  {
    id: '3',
    status: 'Rejected',
    date: '2023-01-03',
    description: 'Request rejected due to budget constraints',
    completed: false,
    rejected: true,
  },
  {
    id: '4',
    status: 'Modified',
    date: '2023-01-04',
    description: 'Request modified and resubmitted',
    completed: true,
    isModified: true,
  },
];

describe('TimelineModal Component', () => {
  const onClose = jest.fn();

  beforeEach(() => {
    onClose.mockClear();
  });

  it('renders timeline steps correctly', () => {
    render(<TimelineModal timeline={mockTimeline} onClose={onClose} />);

    mockTimeline.forEach(step => {
      expect(screen.getByText(step.status)).toBeInTheDocument();
      expect(screen.getByText(step.date)).toBeInTheDocument();
      expect(screen.getByText(step.description)).toBeInTheDocument();
    });
  });

  it('displays correct icons based on step status', () => {
    render(<TimelineModal timeline={mockTimeline} onClose={onClose} />);

    // Check icon for completed step
    const completedStep = screen.getByText('Request Created').parentElement;
    expect(completedStep?.previousSibling).toHaveClass('bg-green-100', 'text-green-500');

    // Clock icon for active step
    const activeStep = screen.getByText('Manager Review').parentElement;
    expect(activeStep?.previousSibling).toHaveClass('bg-purple-100', 'text-purple-500');

    // X icon for rejected step
    const rejectedStep = screen.getByText('Rejected').parentElement;
    expect(rejectedStep?.previousSibling).toHaveClass('bg-red-100', 'text-red-600');

    // Check icon for modified step
    const modifiedStep = screen.getByText('Modified').parentElement;
    expect(modifiedStep?.previousSibling).toHaveClass('bg-green-100', 'text-green-500');
  });

  it('renders connector lines between steps', () => {
    render(<TimelineModal timeline={mockTimeline} onClose={onClose} />);

    const connectorLines = document.querySelectorAll('.absolute.left-\\[1rem\\]');
    expect(connectorLines).toHaveLength(mockTimeline.length - 1);
  });

  it('applies correct color classes to connector lines', () => {
    render(<TimelineModal timeline={mockTimeline} onClose={onClose} />);

    const connectorLines = document.querySelectorAll('.absolute.left-\\[1rem\\]');
    
    // First connector should be green (completed to active)
    expect(connectorLines[0]).toHaveClass('bg-green-200');
    
    // Second connector should be red (active to rejected)
    expect(connectorLines[1]).toHaveClass('bg-red-200');
    
    // Third connector should be green (rejected to modified)
    expect(connectorLines[2]).toHaveClass('bg-green-200');
  });

  it('calls onClose when close button is clicked', () => {
    render(<TimelineModal timeline={mockTimeline} onClose={onClose} />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when X icon is clicked', () => {
    render(<TimelineModal timeline={mockTimeline} onClose={onClose} />);

    const closeIcon = screen.getByRole('button', { name: '' });
    fireEvent.click(closeIcon);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders with empty timeline', () => {
    render(<TimelineModal timeline={[]} onClose={onClose} />);

    expect(screen.getByText('Request Closure Timeline')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /close/i })).toBeInTheDocument();
  });
});