import React from 'react';

interface EmptyStateProps {
  message?: string;
  icon?: string;
  onAdd?: () => void;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  message = 'Không có dữ liệu', 
  icon = 'inventory_2', 
  onAdd,
  className = ''
}) => {
  return (
    <div className={`flex w-full flex-col items-center justify-center py-12 px-4 text-center group cursor-default relative mx-auto ${className}`}>
      <div 
        onClick={onAdd}
        className={`mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 text-slate-200 transition-all duration-500 ease-out 
          ${onAdd ? 'cursor-pointer hover:bg-emerald-50 hover:text-emerald-300 hover:scale-110 hover:-rotate-3 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10' : ''}`}
      >
        <span className="material-symbols-outlined text-[40px]">{icon}</span>
      </div>
      
      <div className="space-y-1">
        <p className="text-sm font-bold text-slate-400 transition-colors group-hover:text-slate-500">{message}</p>
      </div>
    </div>
  );
};

export default EmptyState;
