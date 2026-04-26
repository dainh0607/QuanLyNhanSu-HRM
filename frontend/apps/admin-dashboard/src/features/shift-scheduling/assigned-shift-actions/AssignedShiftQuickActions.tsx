import { useEffect, useRef, useState } from "react";
import type { AssignedShiftActionContext, AssignedShiftQuickActionHandlers } from "./types";
import { authService, hasPermission } from "../../../services/authService";

interface AssignedShiftQuickActionsProps {
  context: AssignedShiftActionContext;
  handlers: AssignedShiftQuickActionHandlers;
}

const QuickActionButton = ({
  icon,
  label,
  onClick,
}: {
  icon: string;
  label: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-[#134BBA] hover:text-[#134BBA]"
    aria-label={label}
    title={label}
  >
    <span className="material-symbols-outlined text-[16px]">{icon}</span>
  </button>
);

export const AssignedShiftQuickActions = ({
  context,
  handlers,
}: AssignedShiftQuickActionsProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const user = authService.getCurrentUser();

  const canRead = hasPermission(user, "shifts", "read");
  const canDelete = hasPermission(user, "shifts", "delete");
  const canCreate = hasPermission(user, "shifts", "create");
  const canUpdateEmployee = hasPermission(user, "employee", "update");

  useEffect(() => {
    if (!isMenuOpen) {
      return undefined;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div className={`absolute inset-0 flex items-center justify-center transition duration-150 ${isMenuOpen ? 'z-50 pointer-events-auto opacity-100' : 'z-10 pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100'}`}>
      <div className={`absolute inset-0 rounded-[6px] ${isMenuOpen ? 'bg-black/5' : 'bg-white/35'} backdrop-blur-[1px]`} />

      <div className="relative flex items-center justify-center gap-1.5 rounded-xl border border-white/90 bg-white/95 p-1.5 shadow-md backdrop-blur">
        {canRead && (
          <QuickActionButton
            icon="visibility"
            label="Xem chi tiết ca"
            onClick={() => handlers.onViewDetails(context)}
          />
        )}

        {canCreate &&
          ["upcoming", "untracked", "paidLeave", "unpaidLeave", "businessTrip"].includes(
            context.shift.attendanceStatus
          ) ? (
            <QuickActionButton
              icon="add"
              label="Thêm ca phụ"
              onClick={() => handlers.onAddSecondaryShift(context)}
            />
          ) : null}

        <div className="relative" ref={menuRef}>
          <QuickActionButton
            icon="more_horiz"
            label="Mở rộng"
            onClick={() => setIsMenuOpen((current) => !current)}
          />

          {isMenuOpen ? (
            <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-60 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-200">
              {canUpdateEmployee && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    handlers.onOpenLeaveRequest(context);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <span className="material-symbols-outlined text-[18px] text-slate-500">
                    event_note
                  </span>
                  Tạo yêu cầu nghỉ phép
                </button>
              )}

              {canRead && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    handlers.onRefreshAttendance(context);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <span className="material-symbols-outlined text-[18px] text-slate-500">
                    sync
                  </span>
                  Tải lại yêu cầu chấm công
                </button>
              )}

              {canRead && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    handlers.onOpenMap(context);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <span className="material-symbols-outlined text-[18px] text-slate-500">
                    location_on
                  </span>
                  Xem trên bản đồ
                </button>
              )}

              {canDelete && (
                <div className="my-1 border-t border-slate-100" />
              )}

              {canDelete && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    handlers.onDeleteShift(context);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-rose-600 transition hover:bg-rose-50"
                >
                  <span className="material-symbols-outlined text-[18px] text-rose-500">
                    delete
                  </span>
                  Xóa ca làm việc
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AssignedShiftQuickActions;
