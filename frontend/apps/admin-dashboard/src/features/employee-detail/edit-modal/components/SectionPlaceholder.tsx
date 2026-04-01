import React from 'react';
import { SECTION_PLACEHOLDER_COPY } from '../constants';
import type { ModalSectionKey } from '../types';

interface SectionPlaceholderProps {
  section: Exclude<ModalSectionKey, 'personal'>;
  label: string;
  icon: string;
}

const SectionPlaceholder: React.FC<SectionPlaceholderProps> = ({ section, label, icon }) => (
  <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50 px-8 py-16 text-center">
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#1c3563] shadow-sm">
      <span className="material-symbols-outlined text-[30px]">{icon}</span>
    </div>
    <h4 className="mt-5 text-xl font-bold text-slate-900">{label}</h4>
    <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-500">
      {SECTION_PLACEHOLDER_COPY[section]}
    </p>
  </div>
);

export default SectionPlaceholder;
