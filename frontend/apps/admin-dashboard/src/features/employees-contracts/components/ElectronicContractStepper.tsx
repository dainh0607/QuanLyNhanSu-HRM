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
    <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-8 lg:px-10">
      <div className="flex items-center justify-between">
        {steps.map((stepLabel, index) => {
          const stepNumber = index + 1;
          const isActive = currentStep === stepNumber;
          const isCompleted = currentStep > stepNumber;
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={stepLabel}>
              <div className="flex flex-col items-center gap-3 relative z-10">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl text-[15px] font-black transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-500 text-white shadow-[0_8px_20px_rgba(16,185,129,0.25)]'
                      : isActive
                        ? 'bg-[#134BBA] text-white shadow-[0_8px_25px_rgba(19,75,186,0.3)] scale-110'
                        : 'bg-white text-slate-400 ring-1 ring-slate-200'
                  }`}
                >
                  {isCompleted ? (
                    <span className="material-symbols-outlined text-[22px] font-bold">check</span>
                  ) : (
                    stepNumber.toString().padStart(2, '0')
                  )}
                </div>
                <div className="text-center">
                  <p
                    className={`text-[10px] font-black uppercase tracking-[0.1em] ${
                      isActive ? 'text-[#134BBA]' : 'text-slate-400'
                    }`}
                  >
                    Bước {stepNumber}
                  </p>
                  <p className={`mt-0.5 text-xs font-bold whitespace-nowrap ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                    {stepLabel}
                  </p>
                </div>
              </div>
              
              {!isLast && (
                <div className="flex-1 px-4 mb-10">
                  <div className="h-[2px] w-full bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-emerald-500 transition-all duration-500 ease-in-out ${isCompleted ? 'w-full' : 'w-0'}`} 
                    />
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};


export default ElectronicContractStepper;
