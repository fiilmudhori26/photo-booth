/**
 * Tests for photo booth template system
 */
import { TEMPLATE_LIST, getTemplate } from "@/lib/templates-render";
import type { PhotoBoothTemplate } from "@/lib/templates";

describe("Template System", () => {
  describe("Template List", () => {
    it("has exactly 5 templates", () => {
      expect(TEMPLATE_LIST).toHaveLength(5);
    });

    it("all templates are valid", () => {
      const templateIds = TEMPLATE_LIST.map((t) => t.id);

      expect(templateIds).toContain("boarding-pass");
      expect(templateIds).toContain("vintage-movie");
      expect(templateIds).toContain("modern-graphic");
      expect(templateIds).toContain("air-mail");
      expect(templateIds).toContain("theater-ticket");
    });
  });

  describe("getTemplate", () => {
    it("returns correct template for valid ID", () => {
      const template = getTemplate("boarding-pass");
      expect(template.id).toBe("boarding-pass");
      expect(template.name).toBe("Boarding Pass");
    });

    it("returns default template for invalid ID", () => {
      const template = getTemplate("invalid-id");
      expect(template.id).toBe("boarding-pass");
    });

    it("each template has photoSlots defined", () => {
      TEMPLATE_LIST.forEach((template) => {
        expect(template.photoSlots).toBeDefined();
        expect(Array.isArray(template.photoSlots)).toBe(true);
      });
    });
  });

  describe("Template Dimensions", () => {
    it("all templates have correct design width (1200px)", () => {
      TEMPLATE_LIST.forEach((template) => {
        expect(template.designWidth).toBe(1200);
      });
    });

    it("all templates have valid aspect ratios", () => {
      TEMPLATE_LIST.forEach((template) => {
        expect(template.aspectRatio).toBeGreaterThan(0);
      });
    });
  });

  describe("Template 1: Boarding Pass", () => {
    it("has 4 photo slots in 2x2 grid", () => {
      const template = getTemplate("boarding-pass");
      expect(template.photoSlots).toHaveLength(4);

      // Verify grid structure (2 rows, 2 columns)
      const topRow = template.photoSlots.slice(0, 2);
      const bottomRow = template.photoSlots.slice(2, 4);

      topRow.forEach((slot) => {
        expect(slot).toHaveProperty("x");
        expect(slot).toHaveProperty("y");
        expect(slot).toHaveProperty("w");
        expect(slot).toHaveProperty("h");
        expect(slot.w).toBeGreaterThan(0);
        expect(slot.h).toBeGreaterThan(0);
      });
    });
  });

  describe("Template 3: Modern Graphic", () => {
    it("has 8 photo slots in staggered 2-column layout", () => {
      const template = getTemplate("modern-graphic");
      expect(template.photoSlots).toHaveLength(8);

      // Verify staggered 2-column structure (4 rows, 2 columns)
      const leftColumn = template.photoSlots.filter((s) => s.x < 600);
      const rightColumn = template.photoSlots.filter((s) => s.x >= 600);

      expect(leftColumn).toHaveLength(4);
      expect(rightColumn).toHaveLength(4);
    });
  });

  describe("Template 4 & 5: Air Mail & Theater Ticket", () => {
    it("have 8 photo slots in dual strip (2x4)", () => {
      ;["air-mail", "theater-ticket"].forEach((id) => {
        const template = getTemplate(id as "air-mail" | "theater-ticket");
        expect(template.photoSlots).toHaveLength(8);

        // Verify dual column structure
        const leftColumn = template.photoSlots.filter((s) => s.x < 600);
        const rightColumn = template.photoSlots.filter((s) => s.x >= 600);

        expect(leftColumn).toHaveLength(4);
        expect(rightColumn).toHaveLength(4);
      });
    });
  });
});