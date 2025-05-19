import React, { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: ReactNode;
  iconClass: string;
  iconBgClass: string;
  children?: ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconClass,
  iconBgClass,
  children
}) => {
  return (
    <div className="card p-6 relative overflow-hidden">
      <div className="absolute right-0 top-0 opacity-10">
        {/* Fixed the icon rendering in the background */}
        {React.cloneElement(icon as React.ReactElement, { 
          className: `h-40 w-40 ${iconClass} -mr-8 -mt-8` 
        })}
      </div>
      <div className="relative z-10">
        <h3 className="font-medium text-muted-foreground mb-2">
          {title}
        </h3>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-semibold">{value}</p>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <div className={`h-16 w-16 flex items-center justify-center rounded-full ${iconBgClass}`}>
            {/* Fixed the icon rendering in the circle */}
            {React.cloneElement(icon as React.ReactElement, { 
              className: `h-10 w-10 ${iconClass}` 
            })}
          </div>
        </div>
        <div className="mt-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default StatCard;