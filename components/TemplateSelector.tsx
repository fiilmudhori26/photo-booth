"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import type { TemplateId } from "@/lib/types";
import { TEMPLATE_LIST } from "@/lib/templates";

export type TemplateCategory = "all" | "ticket" | "retro" | "minimalist";

export interface TemplateSelectorProps {
  selectedTemplate: TemplateId;
  onSelect: (id: TemplateId) => void;
  onContinue: () => void;
}

const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  all: "All",
  ticket: "Ticket",
  retro: "Retro",
  minimalist: "Minimalist",
};

const CATEGORY_TEMPLATES: Record<TemplateCategory, TemplateId[]> = {
  all: ["boarding-pass", "vintage-movie", "modern-graphic", "air-mail", "theater-ticket"],
  ticket: ["boarding-pass", "vintage-movie", "theater-ticket"],
  retro: ["vintage-movie", "modern-graphic"],
  minimalist: ["modern-graphic", "air-mail"],
};

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

interface ButtonProps {
  block?: boolean;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

function Button({
  block = false,
  size = "md",
  disabled = false,
  onClick,
  children,
  className = "",
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cx(
        "flex w-full justify-center rounded-full border-2 font-medium transition ",
        "disabled:cursor-not-allowed disabled:opacity-50 ",
        size === "sm" ? "px-4 py-2 text-sm" : size === "lg" ? "px-6 py-3 text-lg" : "px-5 py-2.5 text-base",
        block ? "w-full" : "w-auto",
        disabled
          ? "border-slate-600 bg-slate-700 text-slate-400"
          : "border-transparent bg-indigo-600 text-white hover:bg-indigo-500",
        className,
      )}
    >
      {children}
    </button>
  );
}

export default function TemplateSelector({
  selectedTemplate,
  onSelect,
  onContinue,
}: TemplateSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>("all");

  const templatesInCategory = CATEGORY_TEMPLATES[activeCategory];

  return (
    <div className="flex h-full flex-col">
      {/* Category Filter */}
      <div className="mb-4">
        <div className="flex space-x-1 rounded-full border border-slate-700/50 bg-slate-900/60 p-1">
          {(Object.keys(CATEGORY_LABELS) as TemplateCategory[]).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cx(
                activeCategory === category
                  ? "rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white"
                  : "rounded-full px-3 py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-800",
              )}
            >
              {CATEGORY_LABELS[category]}
            </button>
          ))}
        </div>
      </div>

      {/* Template Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templatesInCategory.map((templateId) => {
            const template = TEMPLATE_LIST.find((t) => t.id === templateId);
            if (!template) return null;

            return (
              <button
                key={templateId}
                onClick={() => onSelect(templateId)}
                className={cx(
                  selectedTemplate === templateId
                    ? "col-span-full rounded-2xl border-2 border-indigo-500 bg-slate-800/60 p-4 text-left shadow-lg"
                    : "rounded-2xl border-2 border-slate-700/50 bg-slate-900/40 p-4 text-left hover:border-slate-600 transition",
                )}
              >
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">{template.name}</h3>
                  {selectedTemplate === templateId && (
                    <Check className="h-5 w-5 text-indigo-400" />
                  )}
                </div>
                <p className="text-sm text-slate-400">{template.photoSlots?.length ?? 4} photos</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Continue Button */}
      <div className="border-t border-slate-700/50 p-4">
        <Button
          block
          size="lg"
          onClick={onContinue}
          disabled={!selectedTemplate}
        >
          Continue to Camera
        </Button>
      </div>
    </div>
  );
}