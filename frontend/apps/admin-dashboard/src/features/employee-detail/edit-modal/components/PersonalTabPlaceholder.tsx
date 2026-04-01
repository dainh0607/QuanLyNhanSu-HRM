import React from 'react';
import { PERSONAL_TAB_PLACEHOLDER_COPY } from '../constants';

interface PersonalTabPlaceholderProps {
  tab: keyof typeof PERSONAL_TAB_PLACEHOLDER_COPY;
  title: string;
}

const PersonalTabPlaceholder: React.FC<PersonalTabPlaceholderProps> = ({ tab, title }) => (
  <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50 px-8 py-14">
    <div className="flex items-center gap-3">
      <span className="h-[3px] w-10 rounded-full bg-emerald-500"></span>
      <h4 className="text-[20px] font-bold text-slate-950">{title}</h4>
    </div>
    <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-500">
      {PERSONAL_TAB_PLACEHOLDER_COPY[tab]}
    </p>
  </div>
);

export default PersonalTabPlaceholder;
