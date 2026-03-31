import React from 'react';

export interface DetailBlockProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

const DetailBlock: React.FC<DetailBlockProps> = ({
  title,
  description = '',
  children,
  className = '',
}) => (
  <section className={`space-y-5 ${className}`}>
    <div className="flex items-center gap-2.5">
      <div className="h-4 w-[3px] flex-shrink-0 rounded-full bg-[#10b981]"></div>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {description && <p className="mt-0.5 text-xs leading-5 text-slate-400">{description}</p>}
      </div>
    </div>
    <div>{children}</div>
  </section>
);

export default DetailBlock;
