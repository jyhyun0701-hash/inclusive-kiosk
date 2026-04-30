import React from 'react';
import { STEP_LABELS, type KioskStep, type Language } from '../../types/kiosk';

interface StepIndicatorProps {
  currentStep: KioskStep;
  language: Language;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, language }) => {
  const labels = STEP_LABELS[language];

  return (
    <div className="step-bar">
      {labels.map((label, idx) => {
        const stepNum = (idx + 1) as KioskStep;
        const isCompleted = stepNum < currentStep;
        const isActive = stepNum === currentStep;

        return (
          <React.Fragment key={stepNum}>
            {idx > 0 && (
              <div className={`step-connector${isCompleted ? ' completed' : ''}`} />
            )}
            <div className={`step-item${isActive ? ' active' : ''}${isCompleted ? ' completed' : ''}`}>
              <div className="step-circle">
                {isCompleted ? '✓' : stepNum}
              </div>
              <span>{label}</span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StepIndicator;
