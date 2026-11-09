/**
 * Photo booth template system.
 */

/** One photo slot in canvas coordinates */
export interface PhotoSlot {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Canvas dimensions for exports (1200px wide, 300 DPI quality) */
export const TEMPLATE_W = 1200;
export const TEMPLATE_H = 1600;

/** Core options every template needs — the narrow, shared interface. */
export interface TemplateCoreOptions {
  photos: (HTMLImageElement | null)[];
  caption: string;
  dateText: string;
}

/**
 * Template-specific extra options. Only templates that need them read them.
 * Air Mail uses `toText`; no other template reads any of these today.
 */
export interface TemplateExtraOptions {
  fromText?: string;
  toText?: string;
  flightNumber?: string;
  gate?: string;
  seat?: string;
  showTime?: string;
  showName?: string;
  route?: string;
  destination?: string;
}

/** Options passed to every template render function — core + optional extras. */
export type TemplateRenderOptions = TemplateCoreOptions & Partial<TemplateExtraOptions>;

/** A complete photo booth template */
export interface PhotoBoothTemplate {
  id: string;
  name: string;
  aspectRatio: number;
  designWidth: number;
  exportScale: number;
  photoSlots: PhotoSlot[];
  photoCount?: number;
  render: (
    ctx: CanvasRenderingContext2D,
    opts: TemplateCoreOptions,
    scale: number,
  ) => void;
}

export const DEFAULT_TEMPLATE_ID = "boarding-pass" as const;

// Re-export from templates-render (avoid circular dependency)
export { getTemplate, TEMPLATE_LIST } from "./templates-render";
