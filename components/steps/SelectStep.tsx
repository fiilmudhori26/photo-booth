"use client";

import { Camera, Check } from "lucide-react";
import { useState } from "react";
import { cx } from "../ui";
import type { TemplateId } from "@/lib/types";

export type TemplateCategory = "all" | "ticket" | "retro" | "minimalist";

interface SelectStepProps {
  selectedTemplate: TemplateId;
  onSelect: (id: TemplateId) => void;
  onContinue: () => void;
}

const TEMPLATES = [
  {
    id: "boarding-pass" as TemplateId,
    name: "Boarding Pass",
    category: "ticket" as const,
    description: "Air travel style with barcodes and QR codes",
    photoCount: 4,
  },
  {
    id: "vintage-movie" as TemplateId,
    name: "Vintage Movie Ticket",
    category: "ticket" as const,
    description: "Classic cinema tickets with scalloped edges",
    photoCount: 4,
  },
  {
    id: "modern-graphic" as TemplateId,
    name: "Modern Graphic",
    category: "retro" as const,
    description: "Bold layouts with vibrant colors and grain texture",
    photoCount: 8,
  },
  {
    id: "air-mail" as TemplateId,
    name: "Air Mail Postal",
    category: "retro" as const,
    description: "Vintage postal design with stamps and borders",
    photoCount: 8,
  },
  {
    id: "theater-ticket" as TemplateId,
    name: "Theater Show Ticket",
    category: "ticket" as const,
    description: "Elegant theater tickets with serif typography",
    photoCount: 8,
  },
];

const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  all: "All",
  ticket: "Tickets",
  retro: "Retro",
  minimalist: "Minimalist",
};

const TEMPLATES_BY_CATEGORY: Record<TemplateCategory, TemplateId[]> = {
  all: TEMPLATES.map((t) => t.id),
  ticket: ["boarding-pass", "vintage-movie", "theater-ticket"],
  retro: ["modern-graphic", "air-mail", "vintage-movie"],
  minimalist: ["modern-graphic", "boarding-pass"],
};

export default function SelectStep({
  selectedTemplate,
  onSelect,
  onContinue,
}: SelectStepProps) {
  const [activeCategory, setActiveCategory] =
    useState<TemplateCategory>("all");

  const templatesInCategory = TEMPLATES.filter((t) =>
    TEMPLATES_BY_CATEGORY[activeCategory].includes(t.id),
  );

  return (
    <div className="mx-auto w-full max-w-4xl px-4">
      {/* Page heading */}
      <div className="mb-4">
        <h2 className="font-display text-2xl text-white">
          Choose your template
        </h2>
        <p className="font-hand text-base leading-snug text-slate-400">
          Pick a style for your strip — you can change filters and stickers while editing.
        </p>
      </div>

      {/* Category Filter */}
      <div
        role="group"
        aria-label="Filter templates by category"
        className="-mx-4 mb-4 overflow-x-auto px-4 pb-1"
      >
        <div className="flex w-max min-w-full gap-1.5 rounded-2xl border border-slate-800 bg-slate-900/70 p-1.5 sm:w-full">
          {(Object.keys(CATEGORY_LABELS) as TemplateCategory[]).map(
            (category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                aria-pressed={activeCategory === category}
                className={cx(
                  "min-h-11 flex-1 rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400",
                  activeCategory === category
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white",
                )}
              >
                {CATEGORY_LABELS[category]}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {templatesInCategory.map((template) => {
          const isSelected = selectedTemplate === template.id;
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onSelect(template.id)}
              aria-pressed={isSelected}
              className={cx(
                "group relative flex min-h-36 flex-col gap-2 rounded-2xl border p-4 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 sm:p-5",
                isSelected
                  ? "border-indigo-500 bg-indigo-500/10 shadow-[0_0_0_1px_#6366f1,0_18px_40px_-24px_rgba(99,102,241,0.55)]"
                  : "border-slate-800 bg-slate-900/60 hover:-translate-y-0.5 hover:border-slate-600 hover:bg-slate-800/60",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-bold text-white sm:text-lg">
                  {template.name}
                </h3>
                {isSelected && (
                  <span
                    className="grid size-7 shrink-0 place-items-center rounded-full bg-indigo-500 shadow"
                    aria-hidden="true"
                  >
                    <Check className="size-4 text-white" strokeWidth={3} />
                  </span>
                )}
              </div>
              <p className="text-xs leading-relaxed text-slate-400 sm:text-sm">
                {template.description}
              </p>
              <span className="mt-auto inline-flex w-max items-center gap-1.5 rounded-full border border-slate-800 bg-slate-800/60 px-2.5 py-1 text-[11px] font-semibold text-slate-300">
                <Camera className="size-3.5" aria-hidden="true" />
                {template.photoCount}-slot strip
              </span>
            </button>
          );
        })}

        {templatesInCategory.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-8 text-center">
            <p className="text-slate-400">No templates in this category</p>
          </div>
        )}
      </div>

      {/* Continue Button */}
      <div className="mt-5 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={onContinue}
          disabled={!selectedTemplate}
          className="inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl border border-transparent bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 text-base font-bold text-white shadow-[0_16px_36px_-16px_rgba(99,102,241,0.65)] transition hover:from-indigo-500 hover:to-purple-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:min-w-80"
        >
          <Camera className="size-5" aria-hidden="true" />
          Continue to Camera
        </button>
        <p className="font-hand text-sm text-slate-400">
          3 poses with a countdown — filters and stickers come next
        </p>
      </div>
    </div>
  );
}
