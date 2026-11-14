/** Self-check for photo booth template system */
import { TEMPLATE_LIST, getTemplate } from "./templates";
import type { PhotoBoothTemplate } from "./templates";

const EXPECTED_IDS = [
  "boarding-pass",
  "vintage-movie",
  "modern-graphic",
  "air-mail",
  "theater-ticket",
];

describe("templates self-check", () => {
  it("exposes all expected templates with non-empty, valid slots", () => {
    const templates: PhotoBoothTemplate[] = TEMPLATE_LIST;

    for (const id of EXPECTED_IDS) {
      const t = getTemplate(id);
      expect(t.photoSlots.length).toBeGreaterThan(0);
    }

    for (const t of templates) {
      for (const slot of t.photoSlots) {
        expect(slot.w).toBeGreaterThan(0);
        expect(slot.h).toBeGreaterThan(0);
      }
    }
  });
});
