import React from 'react';
import { MODAL_SECTIONS } from '../constants';
import { isModalSectionAvailable } from '../sectionAvailability';
import type { ModalSectionKey } from '../types';

interface EditModalSidebarProps {
  activeSection: ModalSectionKey;
  onChange: (section: ModalSectionKey) => void;
}

const EditModalSidebar: React.FC<EditModalSidebarProps> = ({ activeSection, onChange }) => (
  <aside className="hidden w-[250px] shrink-0 overflow-hidden border-r border-slate-200 bg-slate-50/80 lg:flex lg:flex-col">
    <div className="flex-1 overflow-y-auto py-5">
      {MODAL_SECTIONS.map((section) => {
        const isActive = section.key === activeSection;
        const isAvailable = isModalSectionAvailable(section.key);

        return (
          <button
            key={section.key}
            type="button"
            onClick={() => onChange(section.key)}
            disabled={!isAvailable}
            className={`flex w-full items-center gap-3 border-l-[3px] px-7 py-5 text-left transition-all ${
              isActive
                ? 'border-emerald-500 bg-white text-[#1c3563]'
                : isAvailable
                  ? 'border-transparent text-slate-500 hover:bg-white hover:text-slate-800'
                  : 'cursor-not-allowed border-transparent text-slate-300'
            }`}
          >
            <span className="material-symbols-outlined shrink-0 text-[22px]">{section.icon}</span>
            <span className="whitespace-nowrap text-[14px] font-semibold">{section.label}</span>
          </button>
        );
      })}
    </div>
  </aside>
);

export default EditModalSidebar;
