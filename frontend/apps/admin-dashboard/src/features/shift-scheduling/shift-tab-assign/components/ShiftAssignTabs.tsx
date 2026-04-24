import { useDragToScroll } from "../../../../hooks/useDragToScroll";
import { formatTime } from "../../utils/week";
import type { ShiftTabAssignTab } from "../types";

interface ShiftAssignTabsProps {
  tabs: ShiftTabAssignTab[];
  activeTabKey: string;
  onChange: (tabKey: string) => void;
}

export const ShiftAssignTabs = ({
  tabs,
  activeTabKey,
  onChange,
}: ShiftAssignTabsProps) => {
  const {
    scrollRef,
    isDragging,
    onMouseDown,
    onMouseLeave,
    onMouseUp,
    onMouseMove,
    handleItemClick,
  } = useDragToScroll();

  return (
    <div
      ref={scrollRef}
      onMouseDown={onMouseDown}
      onMouseLeave={onMouseLeave}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
      className={`scrollbar-hide overflow-x-auto border-b border-slate-200 ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
    >
      <div className="flex min-w-max items-center gap-1 px-1">
        {tabs.map((tab) => {
          const isActive = tab.key === activeTabKey;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={(e) => handleItemClick(e, () => onChange(tab.key))}
              className={`relative flex min-w-[180px] flex-col rounded-t-2xl px-4 py-3 text-left transition select-none ${
                isActive
                  ? "bg-[#EFF6FF] text-[#134BBA]"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              <span className="truncate text-sm font-semibold">{tab.shiftName}</span>
              <span className="mt-1 text-xs opacity-80">
                {formatTime(tab.startTime)} - {formatTime(tab.endTime)}
              </span>
              <span
                className={`absolute inset-x-4 bottom-0 h-[2px] rounded-full transition ${
                  isActive ? "bg-[#134BBA]" : "bg-transparent"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ShiftAssignTabs;
