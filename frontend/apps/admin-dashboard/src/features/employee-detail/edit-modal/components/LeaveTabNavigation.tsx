import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LEAVE_TABS } from '../constants';
import type { LeaveFormsState, LeaveTabKey } from '../types';

interface LeaveTabNavigationProps {
  activeTab: LeaveTabKey;
  leaveForms: LeaveFormsState;
  onChange: (tab: LeaveTabKey) => void;
}

const LeaveTabNavigation: React.FC<LeaveTabNavigationProps> = ({
  activeTab,
  leaveForms,
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
      `[data-leave-tab="${activeTab}"]`,
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
    <div className="mt-4 min-w-0 border-b border-slate-100">
      <div className="relative">
        {hasOverflow ? (
          <>
            <div
              className={`pointer-events-none absolute inset-y-0 left-0 z-[1] w-12 bg-gradient-to-r from-white via-white/80 to-transparent transition-opacity ${
                canScrollLeft ? 'opacity-100' : 'opacity-0'
              }`}
            />
            <div
              className={`pointer-events-none absolute inset-y-0 right-0 z-[1] w-12 bg-gradient-to-l from-white via-white/80 to-transparent transition-opacity ${
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
            className={`absolute left-0 top-1/2 z-[2] inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-sm transition-all ${
              canScrollLeft
                ? 'text-slate-600 hover:text-slate-900 border border-slate-200'
                : 'opacity-0 pointer-events-none'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">chevron_left</span>
          </button>
        ) : null}

        <div
          ref={scrollContainerRef}
          onWheel={handleWheel}
          className={`overflow-x-auto overflow-y-hidden scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
            hasOverflow ? 'px-10' : 'px-0'
          }`}
        >
          <div className="flex min-w-max items-center gap-10">
            {LEAVE_TABS.map((tab) => {
              const isActive = tab.key === activeTab;
              const isDirty = leaveForms[tab.key]?.isDirty && leaveForms[tab.key]?.isLoaded;

              return (
                <button
                  key={tab.key}
                  data-leave-tab={tab.key}
                  type="button"
                  onClick={() => onChange(tab.key)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`group relative shrink-0 transition-all py-4 ${
                    isActive
                      ? 'text-orange-600 font-bold'
                      : 'text-slate-400 hover:text-slate-600 font-medium'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-[13px] leading-none">{tab.label}</span>
                    {isDirty ? (
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                    ) : null}
                  </span>
                  
                  {/* Underline Indicator */}
                  <span className={`absolute bottom-0 left-0 right-0 h-[3px] rounded-full transition-all duration-300 ${
                    isActive ? 'bg-orange-500 opacity-100' : 'bg-transparent opacity-0 group-hover:bg-slate-200 group-hover:opacity-100'
                  }`}></span>
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
            className={`absolute right-0 top-1/2 z-[2] inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-sm transition-all ${
              canScrollRight
                ? 'text-slate-600 hover:text-slate-900 border border-slate-200'
                : 'opacity-0 pointer-events-none'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default LeaveTabNavigation;
