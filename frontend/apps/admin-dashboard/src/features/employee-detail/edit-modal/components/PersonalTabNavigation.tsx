import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PERSONAL_TABS } from '../constants';
import type { PersonalFormsState, PersonalTabKey } from '../types';
import { formsEqual } from '../utils';

interface PersonalTabNavigationProps {
  activeTab: PersonalTabKey;
  personalForms: PersonalFormsState;
  onChange: (tab: PersonalTabKey) => void;
}

const PersonalTabNavigation: React.FC<PersonalTabNavigationProps> = ({
  activeTab,
  personalForms,
  onChange,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    setCanScrollLeft(container.scrollLeft > 8);
    setCanScrollRight(container.scrollLeft + container.clientWidth < container.scrollWidth - 8);
  }, []);

  useEffect(() => {
    updateScrollState();

    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    const handleScroll = () => updateScrollState();
    const handleResize = () => updateScrollState();

    container.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [updateScrollState]);

  useEffect(() => {
    const activeButton = scrollContainerRef.current?.querySelector<HTMLButtonElement>(
      `[data-personal-tab="${activeTab}"]`,
    );

    activeButton?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [activeTab]);

  const handleScrollBy = (direction: 'left' | 'right') => {
    scrollContainerRef.current?.scrollBy({
      left: direction === 'left' ? -240 : 240,
      behavior: 'smooth',
    });
  };

  return (
    <div className="mt-7 flex items-center gap-2">
      <button
        type="button"
        onClick={() => handleScrollBy('left')}
        disabled={!canScrollLeft}
        className={`inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border transition-colors ${
          canScrollLeft
            ? 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
            : 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300'
        }`}
        aria-label="Cuộn sang trái"
      >
        <span className="material-symbols-outlined text-[18px]">chevron_left</span>
      </button>

      <div className="min-w-0 flex-1 overflow-hidden">
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex min-w-max items-center gap-8 border-b border-slate-200">
            {PERSONAL_TABS.map((tab) => {
              const isActive = tab.key === activeTab;
              const isDirty =
                !formsEqual(personalForms[tab.key].data, personalForms[tab.key].initialData) &&
                personalForms[tab.key].isLoaded;

              return (
                <button
                  key={tab.key}
                  data-personal-tab={tab.key}
                  type="button"
                  onClick={() => onChange(tab.key)}
                  className={`relative whitespace-nowrap pb-4 text-sm font-semibold transition-colors ${
                    isActive ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                  {isDirty ? (
                    <span className="ml-2 inline-block h-2.5 w-2.5 rounded-full bg-emerald-500 align-middle"></span>
                  ) : null}
                  {isActive ? (
                    <span className="absolute inset-x-0 bottom-[-1px] h-0.5 rounded-full bg-emerald-500"></span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => handleScrollBy('right')}
        disabled={!canScrollRight}
        className={`inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border transition-colors ${
          canScrollRight
            ? 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
            : 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300'
        }`}
        aria-label="Cuộn sang phải"
      >
        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
      </button>
    </div>
  );
};

export default PersonalTabNavigation;
