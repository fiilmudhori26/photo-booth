/** Re-export barrel for backward compatibility.
 *
 * Concerns have been split into focused modules:
 * - date-stamp.ts   → formatStamp, fileStamp
 * - download.ts     → downloadDataUrl
 * - template-export.ts → renderTemplateToDataUrl
 * - strip-export.ts → renderStripToDataUrl
 */

export {
  formatStamp,
  fileStamp,
} from "./date-stamp";

export { downloadDataUrl } from "./download";

export {
  TEMPLATE_EXPORT_SCALE,
  renderTemplateToDataUrl,
} from "./template-export";

export {
  STRIP_EXPORT_SCALE,
  renderStripToDataUrl,
} from "./strip-export";
