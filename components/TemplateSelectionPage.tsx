"use client";

import { Camera } from "lucide-react";
import { useState } from "react";

export type TemplateId = "boarding-pass" | "vintage-movie" | "modern-graphic" | "air-mail" | "theater-ticket";

export type TemplateCategory = "all" | "ticket" | "retro" | "minimalist";

export interface TemplateSelectionPageProps {
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
    photoCount: 6,
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

// Group templates by category for filtering
const TEMPLATES_BY_CATEGORY: Record<TemplateCategory, TemplateId[]> = {
  all: TEMPLATES.map((t) => t.id),
  ticket: ["boarding-pass", "vintage-movie", "theater-ticket"],
  retro: ["modern-graphic", "air-mail", "vintage-movie"],
  minimalist: ["modern-graphic", "boarding-pass"],
};

export default function TemplateSelectionPage({
  selectedTemplate,
  onSelect,
  onContinue,
}: TemplateSelectionPageProps) {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>("all");

  const templatesInCategory = TEMPLATES.filter((t) =>
    TEMPLATES_BY_CATEGORY[activeCategory].includes(t.id),
  );

  return (
    <div className="flex h-full flex-col">
      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex space-x-2 rounded-full border-2 border-slate-700/50 bg-slate-900/60 p-1">
          {(Object.keys(CATEGORY_LABELS) as TemplateCategory[]).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cx(
                activeCategory === category
                  ? "rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white"
                  : "rounded-full px-4 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800",
              )}
            >
              {CATEGORY_LABELS[category]}
            </button>
          ))}
        </div>
      </div>

      {/* Template Grid */}
      <div className="flex-1 space-y-3 overflow-y-auto">
        {templatesInCategory.map((template) => {
          const isSelected = selectedTemplate === template.id;
          return (
            <button
              key={template.id}
              onClick={() => onSelect(template.id)}
              className={cx(
                isSelected
                  ? "col-span-full rounded-2xl border-2 border-indigo-500 bg-slate-800/60 p-4 text-left shadow-lg"
                  : "rounded-2xl border-2 border-slate-700/50 bg-slate-900/40 p-4 text-left hover:border-slate-600 transition",
              )}
            >
              <div className="mb-2 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{template.name}</h3>
                  <p className="mt-1 text-sm text-slate-400">{template.description}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full border-2 border-slate-700/50 bg-slate-900/40 px-2 py-0.5 text-xs">
                      <Camera className="size-3" />
                      {template.photoCount} photos
                    </span>
                  </div>
                </div>
                {isSelected && (
                  <span className="ml-3 rounded-full bg-indigo-600 px-2 py-1">
                    <svg
                      className="size-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                )}
              </div>
            </button>
          );
        })}

        {templatesInCategory.length === 0 && (
          <div className="rounded-2xl border-2 border-slate-700/50 bg-slate-900/40 p-8 text-center">
            <p className="text-slate-400">No templates in this category</p>
          </div>
        )}
      </div>

      {/* Continue Button */}
      <div className="border-t border-slate-700/50 p-4">
        <button
          type="button"
          onClick={onContinue}
          disabled={!selectedTemplate}
          className={cx(
            "w-full rounded-2xl border-2 px-5 py-3 font-bold transition",
            selectedTemplate
              ? "border-transparent bg-indigo-600 text-white hover:bg-indigo-500"
              : "border-slate-700/50 bg-slate-800/60 text-slate-500 cursor-not-allowed",
          )}
        >
          Continue to Camera
        </button>
      </div>
    </div>
  );
}

// Helper function for class names
function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}