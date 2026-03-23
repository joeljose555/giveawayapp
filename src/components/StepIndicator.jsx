import React from 'react';
import { motion } from 'framer-motion';

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
      <motion.div
        className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-white text-sm font-semibold text-primary"
        initial={{ scale: 0.6 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </motion.div>
    );
  }

  if (isActive) {
    return (
      <motion.div
        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white"
        initial={{ scale: 0.85 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 350, damping: 18 }}
      >
        {index + 1}
      </motion.div>
    );
  }

  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-text-secondary transition-colors duration-300">
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
                  className={`text-sm font-medium transition-colors duration-300 ${
                    currentStep === idx + 1
                      ? 'text-text-primary'
                      : 'text-text-secondary'
                  }`}
                >
                  {label}
                </div>
              </div>
              {!isLast && (
                <div className="mx-3 h-[2px] flex-1 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                    style={{ width: isCompleted ? '100%' : '0%' }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
