import React from 'react';
import { NavLink } from 'react-router-dom';

const TABS = [
  {
    to: '/personnel/employees',
    label: 'Nhan vien',
    description: 'Danh sach ho so nhan su',
    icon: 'groups',
  },
  {
    to: '/personnel/contracts',
    label: 'Hop dong',
    description: 'Quan ly hop dong lao dong',
    icon: 'description',
  },
  {
    to: '/personnel/shift-scheduling',
    label: 'Xep ca',
    description: 'Bang xep ca nhan vien theo tuan',
    icon: 'calendar_view_week',
  },
] as const;

const getTabClassName = (isActive: boolean) =>
  `group flex min-w-[200px] items-start gap-3 rounded-2xl border px-4 py-3 text-left transition-all ${
    isActive
      ? 'border-[#134BBA] bg-[#134BBA]/5 shadow-[0_10px_30px_rgba(19,75,186,0.08)]'
      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
  }`;

const PersonnelWorkspaceTabs: React.FC = () => {
  return (
    <section className="mb-6 shrink-0">
      <div className="rounded-[28px] border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-center gap-3">
          {TABS.map((tab) => (
            <NavLink key={tab.to} to={tab.to} className={({ isActive }) => getTabClassName(isActive)}>
              {({ isActive }) => (
                <>
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                      isActive ? 'bg-[#134BBA] text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[22px]">{tab.icon}</span>
                  </div>

                  <div className="min-w-0">
                    <p className={`text-sm font-semibold ${isActive ? 'text-[#134BBA]' : 'text-slate-900'}`}>
                      {tab.label}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{tab.description}</p>
                  </div>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PersonnelWorkspaceTabs;
