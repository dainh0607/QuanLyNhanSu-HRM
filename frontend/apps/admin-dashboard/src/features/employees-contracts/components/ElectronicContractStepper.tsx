import React from 'react';

interface ElectronicContractStepperProps {
  currentStep: number;
  steps: readonly string[];
}

const ElectronicContractStepper: React.FC<ElectronicContractStepperProps> = ({
  currentStep,
  steps,
}) => {
  return (
    <div className="border-b border-slate-200 px-6 py-5 lg:px-8">
      <div className="grid gap-4 lg:grid-cols-5">
        {steps.map((stepLabel, index) => {
          const stepNumber = index + 1;
          const isActive = currentStep === stepNumber;
          const isCompleted = currentStep > stepNumber;

          return (
            <div key={stepLabel} className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                  isCompleted
                    ? 'bg-emerald-500 text-white'
                    : isActive
                      ? 'bg-[#134BBA] text-white'
                      : 'bg-slate-100 text-slate-500'
                }`}
              >
                {isCompleted ? (
                  <span className="material-symbols-outlined text-[18px]">check</span>
                ) : (
                  stepNumber
                )}
              </div>
              <div>
                <p
                  className={`text-xs font-semibold uppercase tracking-wider ${
                    isActive ? 'text-[#134BBA]' : 'text-slate-400'
                  }`}
                >
                  Bước {stepNumber}
                </p>
                <p className={`text-sm font-semibold ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                  {stepLabel}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ElectronicContractStepper;
