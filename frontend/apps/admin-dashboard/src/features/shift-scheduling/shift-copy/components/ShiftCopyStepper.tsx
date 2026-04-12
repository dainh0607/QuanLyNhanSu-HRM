import type { ShiftCopyStep } from "../types";

interface ShiftCopyStepperProps {
  currentStep: ShiftCopyStep;
}

const STEPS: Array<{
  step: ShiftCopyStep;
  label: string;
  icon: string;
}> = [
  { step: 1, label: "Chọn Đối tượng", icon: "groups" },
  { step: 2, label: "Chọn Thời gian", icon: "calendar_month" },
  { step: 3, label: "Chọn Ca làm", icon: "schedule" },
];

export const ShiftCopyStepper = ({ currentStep }: ShiftCopyStepperProps) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      {STEPS.map((item, index) => {
        const isActive = currentStep === item.step;
        const isCompleted = currentStep > item.step;

        return (
          <div key={item.step} className="flex flex-1 items-center gap-3">
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition ${
                  isCompleted
                    ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                    : isActive
                      ? "border-[#134BBA] bg-[#EFF6FF] text-[#134BBA]"
                      : "border-slate-200 bg-white text-slate-400"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isCompleted ? "check" : item.icon}
                </span>
              </span>

              <div className="min-w-0">
                <p
                  className={`text-xs font-semibold uppercase tracking-[0.08em] ${
                    isActive || isCompleted ? "text-[#134BBA]" : "text-slate-400"
                  }`}
                >
                  Bước {item.step}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{item.label}</p>
              </div>
            </div>

            {index < STEPS.length - 1 ? (
              <div className="hidden flex-1 md:block">
                <div
                  className={`h-[2px] w-full rounded-full ${
                    currentStep > item.step ? "bg-[#134BBA]" : "bg-slate-200"
                  }`}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  </div>
);

export default ShiftCopyStepper;
