interface EmployeeDetailTabsProps<TTab extends string> {
  tabs: readonly TTab[];
  activeTab: TTab;
  onChange: (tab: TTab) => void;
}

const EmployeeDetailTabs = <TTab extends string>({
  tabs,
  activeTab,
  onChange,
}: EmployeeDetailTabsProps<TTab>) => (
  <div className="mt-5 overflow-x-auto border-b border-slate-200">
    <div className="flex min-w-max items-center gap-3 pb-1">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`rounded-t-lg border px-4 py-2 text-sm font-semibold transition-all ${
            activeTab === tab
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm'
              : 'border-transparent text-slate-500 hover:bg-white hover:text-slate-800'
          }`}
          type="button"
        >
          {tab}
        </button>
      ))}
    </div>
  </div>
);

export default EmployeeDetailTabs;
