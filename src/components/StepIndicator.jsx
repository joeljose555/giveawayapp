import React from 'react';

const steps = [
  'Scan Sweepstakes Post',
  'Find Attendance',
  'Determine Winner',
];

function StepCircle({ index, currentStep }) {
  const isActive = currentStep === index + 1;
  const isCompleted = currentStep > index + 1;

  if (isCompleted) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-white text-sm font-semibold text-primary">
        ✓
      </div>
    );
  }

  if (isActive) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
        {index + 1}
      </div>
    );
  }

  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-text-secondary">
      {index + 1}
    </div>
  );
}

export default function StepIndicator({ currentStep }) {
  return (
    <div className="rounded-2xl bg-card-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        {steps.map((label, idx) => {
          const isLast = idx === steps.length - 1;
          const isCompleted = currentStep > idx + 1;

          return (
            <div className="flex flex-1 items-center" key={label}>
              <div className="flex items-center gap-3">
                <StepCircle index={idx} currentStep={currentStep} />
                <div
                  className={`text-sm font-medium ${
                    currentStep === idx + 1
                      ? 'text-text-primary'
                      : 'text-text-secondary'
                  }`}
                >
                  {label}
                </div>
              </div>
              {!isLast && (
                <div
                  className={`mx-3 h-[2px] flex-1 rounded-full ${
                    isCompleted ? 'bg-primary' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

