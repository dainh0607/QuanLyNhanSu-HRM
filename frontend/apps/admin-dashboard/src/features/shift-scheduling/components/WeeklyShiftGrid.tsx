import type { FC } from 'react';
import WeeklyShiftDayCell from './WeeklyShiftDayCell';
import WeeklyShiftEmployeeCell from './WeeklyShiftEmployeeCell';
import WeeklyShiftGridHeader from './WeeklyShiftGridHeader';
import type { WeeklyShiftBoardData, WeeklyShiftEmployeeRow, WeeklyShiftSettings } from '../types';

interface WeeklyShiftGridProps {
  board: WeeklyShiftBoardData;
  rows: WeeklyShiftEmployeeRow[];
  employeeSearch: string;
  onEmployeeSearchChange: (value: string) => void;
  onAddEmployee: () => void;
  onCreateOpenShift: (date: string) => void;
  settings: WeeklyShiftSettings;
}

const WeeklyShiftGrid: FC<WeeklyShiftGridProps> = ({
  board,
  rows,
  employeeSearch,
  onEmployeeSearchChange,
  onAddEmployee,
  onCreateOpenShift,
  settings,
}) => {
  const gridTemplateColumns = `minmax(300px, 300px) repeat(${board.days.length}, minmax(210px, 1fr))`;

  return (
    <section className="min-h-0 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="min-h-0 overflow-auto">
        <div className="grid w-max min-w-full" style={{ gridTemplateColumns }}>
          <WeeklyShiftGridHeader
            days={board.days}
            employeeSearch={employeeSearch}
            onEmployeeSearchChange={onEmployeeSearchChange}
            employeeCount={rows.length}
          />

          <div className="sticky left-0 z-10 bg-white shadow-[12px_0_24px_rgba(15,23,42,0.04)]">
            <WeeklyShiftEmployeeCell
              variant="open"
              label="Ca mo"
              subtitle="Tong hop cac ca chua co nguoi nhan"
            />
          </div>

          {board.openShiftRow.cells.map((cell) => (
            <div key={`open-${cell.date}`} className="border-b border-slate-200 bg-[#f8fbff]">
              <WeeklyShiftDayCell
                cell={cell}
                compactCards={settings.compactCards}
                highlightShortage={settings.highlightShortage}
                onCreateOpenShift={onCreateOpenShift}
              />
            </div>
          ))}

          {rows.map((row, rowIndex) => (
            <div key={row.employee.id} className="contents">
              <div
                className={`sticky left-0 z-[5] bg-white shadow-[12px_0_24px_rgba(15,23,42,0.04)] ${
                  rowIndex !== rows.length - 1 ? 'border-b border-slate-200' : ''
                }`}
              >
                <WeeklyShiftEmployeeCell
                  employee={row.employee}
                  totalHours={row.totalHours}
                  showAvatar={settings.showEmployeeAvatar}
                />
              </div>

              {row.cells.map((cell) => (
                <div key={`${row.employee.id}-${cell.date}`} className="border-b border-slate-200 bg-white">
                  <WeeklyShiftDayCell
                    cell={cell}
                    compactCards={settings.compactCards}
                    highlightShortage={settings.highlightShortage}
                  />
                </div>
              ))}
            </div>
          ))}

          <div className="sticky left-0 z-[5] border-r border-slate-200 bg-white shadow-[12px_0_24px_rgba(15,23,42,0.04)]">
            <WeeklyShiftEmployeeCell
              variant="footer"
              action={
                <button
                  type="button"
                  onClick={onAddEmployee}
                  className="inline-flex items-center gap-3 rounded-2xl border border-dashed border-[#134BBA]/40 bg-[#eff6ff] px-4 py-3 text-sm font-semibold text-[#134BBA] transition-colors hover:border-[#134BBA] hover:bg-[#dbeafe]"
                >
                  <span className="material-symbols-outlined text-[20px]">person_add</span>
                  Them nhan vien
                </button>
              }
            />
          </div>

          {board.days.map((day) => (
            <div key={`footer-${day.date}`} className="border-t border-slate-200 bg-slate-50" />
          ))}
        </div>
      </div>
    </section>
  );
};

export default WeeklyShiftGrid;
