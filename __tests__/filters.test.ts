/** Tests for filter pixel manipulation */
import { applyFilterToData, FILTER_PRESETS } from "@/lib/filters";
import type { FilterId } from "@/lib/types";

function makeRGBAArray(r: number, g: number, b: number, a = 255): Uint8ClampedArray {
  return new Uint8ClampedArray([r, g, b, a]);
}

describe("FILTER_PRESETS", () => {
  it("has 5 presets", () => {
    expect(FILTER_PRESETS).toHaveLength(5);
  });

  it("each preset has id, label, icon, hint", () => {
    FILTER_PRESETS.forEach((preset) => {
      expect(preset.id).toBeDefined();
      expect(preset.label).toBeDefined();
      expect(preset.icon).toBeDefined();
      expect(preset.hint).toBeDefined();
    });
  });
});

describe("applyFilterToData - normal", () => {
  it("does nothing for 'normal' filter", () => {
    const data = makeRGBAArray(100, 150, 200);
    const original = new Uint8ClampedArray(data);
    applyFilterToData("normal", data);
    expect(data).toEqual(original);
  });
});

describe("applyFilterToData - bw", () => {
  it("converts to grayscale", () => {
    // l = 0.299*r + 0.587*g + 0.114*b
    const r = 100, g = 150, b = 200;
    const l = 0.299 * r + 0.587 * g + 0.114 * b;
    const v = Math.max(0, Math.min(255, (l - 128) * 1.14 + 133));
    const data = makeRGBAArray(r, g, b);
    applyFilterToData("bw", data);
    expect(data[0]).toBe(Math.round(v));
    expect(data[1]).toBe(Math.round(v));
    expect(data[2]).toBe(Math.round(v));
    expect(data[3]).toBe(255);
  });
});

describe("applyFilterToData - vintage", () => {
  it("applies vintage sepia-like transform", () => {
    const data = makeRGBAArray(100, 150, 200);
    applyFilterToData("vintage", data);
    // Should have changed pixel values
    expect(data[0]).not.toBe(100);
    expect(data[1]).not.toBe(150);
    expect(data[2]).not.toBe(200);
  });
});

describe("applyFilterToData - pink", () => {
  it("shifts towards pink", () => {
    const data = makeRGBAArray(100, 100, 100);
    applyFilterToData("pink", data);
    // pink filter adds to red and blue more than green
    expect(data[0]).toBeGreaterThan(100);
    expect(data[2]).toBeGreaterThan(100);
  });
});

describe("applyFilterToData - contrast", () => {
  it("increases contrast", () => {
    const data = makeRGBAArray(50, 50, 50);
    applyFilterToData("contrast", data);
    // dark pixels should get darker
    expect(data[0]).toBeLessThan(50);
  });
});
