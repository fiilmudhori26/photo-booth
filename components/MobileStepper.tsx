"use client";

import { Check, Camera, Download, Image, Paintbrush } from "lucide-react";
import { cx } from "./ui";

export type StepperStep = "select" | "capture" | "edit" | "export";

export interface StepperProps {
  step: StepperStep;
  onChange: (step: StepperStep) => void;
}

const STEPS = [
  { id: "select" as StepperStep, label: "Template", icon: Image },
  { id: "capture" as StepperStep, label: "Capture", icon: Camera },
  { id: "edit" as StepperStep, label: "Edit", icon: Paintbrush },
  { id: "export" as StepperStep, label: "Export", icon: Download },
];

export default function MobileStepper({ step, onChange }: StepperProps) {
  return (
    <nav className="fixed bottom-16 left-0 right-0 mx-auto w-full max-w-md justify-center gap-1 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm px-4 py-3">
      <div className="flex items-center justify-around">
        {STEPS.map(({ id, label, icon: Icon }) => {
          const isActive = id === step;
          const stepOrder = { select: 0, capture: 1, edit: 2, export: 3 };
          const currentStepIndex = stepOrder[step];
          const stepIndex = stepOrder[id];
          const isCompleted = stepIndex < currentStepIndex;

          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={cx(
                "flex flex-col items-center gap-1 rounded-full px-3 py-2 text-xs font-medium transition",
                isActive
                  ? "text-indigo-400"
                  : isCompleted
                    ? "text-slate-300"
                    : "text-slate-500",
              )}
            >
              <Icon className="size-5" />
              <span>{label}</span>
              {isActive && (
                <div className="mt-0.5 h-1 w-6 rounded-full bg-indigo-500" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function StepIndicator() {
  return (
    <div className="animate-pulse rounded-full bg-indigo-500/50 w-2 h-2" />
  );
}