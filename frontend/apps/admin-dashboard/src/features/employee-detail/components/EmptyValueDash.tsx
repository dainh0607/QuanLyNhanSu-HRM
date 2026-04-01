import React from 'react';

interface EmptyValueDashProps {
  className?: string;
}

const EmptyValueDash: React.FC<EmptyValueDashProps> = ({ className = '' }) => (
  <span className={`inline-block align-baseline text-sm font-semibold leading-6 text-slate-300 ${className}`}>
    -
  </span>
);

export default EmptyValueDash;
