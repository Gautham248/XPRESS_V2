import React from 'react';
import { render, screen } from '@testing-library/react';
import StatCard from '../StatCard';
import { Activity } from 'lucide-react';

describe('StatCard Component', () => {
  const defaultProps = {
    title: 'Total Revenue',
    value: '$50,000',
    subtitle: 'Last 30 days',
    icon: <Activity />,
    iconClass: 'text-blue-500',
    iconBgClass: 'bg-blue-100',
  };

  it('renders card with all required props', () => {
    render(<StatCard {...defaultProps} />);

    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('$50,000')).toBeInTheDocument();
    expect(screen.getByText('Last 30 days')).toBeInTheDocument();
  });

  it('renders icon with correct classes', () => {
    render(<StatCard {...defaultProps} />);

    const iconContainer = screen.getByText('$50,000').parentElement?.nextElementSibling;
    expect(iconContainer).toHaveClass('bg-blue-100');
    
    const icon = iconContainer?.querySelector('svg');
    expect(icon).toHaveClass('text-blue-500');
  });

  it('renders background icon with opacity', () => {
    render(<StatCard {...defaultProps} />);

    const backgroundIcon = document.querySelector('.opacity-10');
    expect(backgroundIcon).toBeInTheDocument();
    
    const icon = backgroundIcon?.querySelector('svg');
    expect(icon).toHaveClass('h-40', 'w-40', 'text-blue-500');
  });

  it('renders children content when provided', () => {
    render(
      <StatCard {...defaultProps}>
        <div data-testid="child-content">Additional Content</div>
      </StatCard>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Additional Content')).toBeInTheDocument();
  });

  it('renders numeric values correctly', () => {
    const numericProps = {
      ...defaultProps,
      value: 42,
    };

    render(<StatCard {...numericProps} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('applies custom icon classes', () => {
    const customProps = {
      ...defaultProps,
      iconClass: 'text-custom-color',
      iconBgClass: 'bg-custom-bg',
    };

    render(<StatCard {...customProps} />);

    const iconContainer = screen.getByText('$50,000').parentElement?.nextElementSibling;
    expect(iconContainer).toHaveClass('bg-custom-bg');
    
    const icon = iconContainer?.querySelector('svg');
    expect(icon).toHaveClass('text-custom-color');
  });
});