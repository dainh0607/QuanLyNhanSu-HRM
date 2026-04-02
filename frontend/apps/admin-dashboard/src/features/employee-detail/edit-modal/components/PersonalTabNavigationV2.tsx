import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PERSONAL_TABS } from '../constants';
import type { PersonalFormsState, PersonalTabKey } from '../types';

interface PersonalTabNavigationProps {
  activeTab: PersonalTabKey;
  personalForms: PersonalFormsState;
  onChange: (tab: PersonalTabKey) => void;
}

const PersonalTabNavigationV2: React.FC<PersonalTabNavigationProps> = ({
  activeTab,
  personalForms,
  onChange,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      setHasOverflow(false);
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const nextHasOverflow = container.scrollWidth > container.clientWidth + 8;
    setHasOverflow(nextHasOverflow);
    setCanScrollLeft(nextHasOverflow && container.scrollLeft > 8);
    setCanScrollRight(
      nextHasOverflow &&
        container.scrollLeft + container.clientWidth < container.scrollWidth - 8,
    );
  }, []);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(updateScrollState);

    const container = scrollContainerRef.current;
    if (!container) {
      return () => {
        window.cancelAnimationFrame(frameId);
      };
    }

    const handleScroll = () => updateScrollState();
    const handleResize = () => updateScrollState();

    container.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      window.cancelAnimationFrame(frameId);
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
      inline: 'nearest',
    });

    window.requestAnimationFrame(updateScrollState);
  }, [activeTab, updateScrollState]);

  const handleScrollBy = (direction: 'left' | 'right') => {
    scrollContainerRef.current?.scrollBy({
      left: direction === 'left' ? -240 : 240,
      behavior: 'smooth',
    });
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    const container = scrollContainerRef.current;
    if (!container || !hasOverflow) {
      return;
    }

    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
      return;
    }

    event.preventDefault();
    container.scrollBy({
      left: event.deltaY,
      behavior: 'auto',
    });
  };

  return (
    <div className="mt-5 min-w-0">
      <div className="rounded-[24px] border border-slate-200/90 bg-slate-50/85 p-2 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
        <div className="relative">
          {hasOverflow ? (
            <>
              <div
                className={`pointer-events-none absolute inset-y-0 left-0 z-[1] w-16 rounded-l-[20px] bg-gradient-to-r from-slate-50 via-slate-50/90 to-transparent transition-opacity ${
                  canScrollLeft ? 'opacity-100' : 'opacity-0'
                }`}
              />
              <div
                className={`pointer-events-none absolute inset-y-0 right-0 z-[1] w-16 rounded-r-[20px] bg-gradient-to-l from-slate-50 via-slate-50/90 to-transparent transition-opacity ${
                  canScrollRight ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </>
          ) : null}

          {hasOverflow ? (
            <button
              type="button"
              onClick={() => handleScrollBy('left')}
              disabled={!canScrollLeft}
              className={`absolute left-2 top-1/2 z-[2] inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border shadow-sm transition-all ${
                canScrollLeft
                  ? 'border-slate-200 bg-white text-slate-600 hover:-translate-y-1/2 hover:border-slate-300 hover:text-slate-900'
                  : 'cursor-not-allowed border-slate-100 bg-white/80 text-slate-300'
              }`}
              aria-label="Scroll left"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
          ) : null}

          <div
            ref={scrollContainerRef}
            onWheel={handleWheel}
            className={`overflow-x-auto overflow-y-hidden scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
              hasOverflow ? 'px-12' : 'px-1'
            }`}
          >
            <div className="flex min-w-max items-center gap-2 py-1">
              {PERSONAL_TABS.map((tab) => {
                const isActive = tab.key === activeTab;
                const isDirty = personalForms[tab.key].isDirty && personalForms[tab.key].isLoaded;

                return (
                  <button
                    key={tab.key}
                    data-personal-tab={tab.key}
                    type="button"
                    onClick={() => onChange(tab.key)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`relative shrink-0 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-[0_10px_24px_rgba(15,23,42,0.10)] ring-1 ring-emerald-100'
                        : 'text-slate-500 hover:bg-white/80 hover:text-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{tab.label}</span>
                      {isDirty ? (
                        <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                      ) : null}
                    </span>
                    {isActive ? (
                      <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-emerald-500"></span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          {hasOverflow ? (
            <button
              type="button"
              onClick={() => handleScrollBy('right')}
              disabled={!canScrollRight}
              className={`absolute right-2 top-1/2 z-[2] inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border shadow-sm transition-all ${
                canScrollRight
                  ? 'border-slate-200 bg-white text-slate-600 hover:-translate-y-1/2 hover:border-slate-300 hover:text-slate-900'
                  : 'cursor-not-allowed border-slate-100 bg-white/80 text-slate-300'
              }`}
              aria-label="Scroll right"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default PersonalTabNavigationV2;
