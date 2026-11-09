/** Self-check for photo booth template system */
import { TEMPLATE_LIST, getTemplate } from "./templates";
import type { PhotoBoothTemplate, PhotoSlot } from "./templates";

// Basic validation
const templates: PhotoBoothTemplate[] = TEMPLATE_LIST;
const expectedIds = ["boarding-pass", "vintage-movie", "modern-graphic", "air-mail", "theater-ticket"];

console.log("Template system self-check:");
console.log(`  Templates: ${templates.length}`);
console.log(`  Expected: ${expectedIds.length}`);

for (const id of expectedIds) {
  const t = getTemplate(id);
  console.log(`  ${id}: ${t.name} (${t.photoSlots.length} slots)`);
  if (t.photoSlots.length === 0) {
    console.error(`  ERROR: ${id} has no photo slots`);
    process.exit(1);
  }
}

// Verify all photo slots have valid dimensions
for (const t of templates) {
  for (const slot of t.photoSlots) {
    if (slot.w <= 0 || slot.h <= 0) {
      console.error(`  ERROR: ${t.id} has invalid slot dimensions: ${slot.w}x${slot.h}`);
      process.exit(1);
    }
  }
}

console.log("  All checks passed ✓");

// Export for module consumers
export {};