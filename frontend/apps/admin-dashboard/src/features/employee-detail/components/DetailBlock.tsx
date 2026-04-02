import React from 'react';

export interface DetailBlockProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

const DetailBlock: React.FC<DetailBlockProps> = ({
  title,
  description = '',
  children,
  className = '',
  action,
}) => (
  <section className={`space-y-5 ${className}`}>
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="h-4 w-[3px] flex-shrink-0 rounded-full bg-[#10b981]"></div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {description && <p className="mt-0.5 text-xs leading-5 text-slate-400">{description}</p>}
        </div>
      </div>
      {action ? <div className="flex-shrink-0">{action}</div> : null}
    </div>
    <div>{children}</div>
  </section>
);

export default DetailBlock;
