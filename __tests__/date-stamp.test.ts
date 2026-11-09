/** Tests for date-stamp utilities */
import { formatStamp, fileStamp } from "@/lib/date-stamp";

describe("formatStamp", () => {
  it("formats a date in en-GB uppercase style", () => {
    const date = new Date(2026, 10, 9, 18, 30, 45); // local time
    const result = formatStamp(date);
    expect(result).toMatch(/^\d{2} [A-Z]{3} \d{4}$/);
  });

  it("is uppercase", () => {
    const date = new Date(2026, 0, 1);
    expect(formatStamp(date)).toBe(formatStamp(date).toUpperCase());
  });

  it("uses the local month name", () => {
    const date = new Date(2026, 0, 1); // January
    const result = formatStamp(date);
    // en-GB format: "01 JAN 2026" (locale-dependent month name)
    expect(result).toMatch(/^01 [A-Z]{3} 2026$/);
  });
});

describe("fileStamp", () => {
  it("produces a compact filename-safe timestamp", () => {
    const date = new Date(2026, 10, 9, 18, 30, 45); // local time
    const result = fileStamp(date);
    const pad = (n: number) => String(n).padStart(2, "0");
    const expected = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}`;
    expect(result).toBe(expected);
    expect(result).toMatch(/^\d{8}-\d{4}$/);
  });

  it("pads single-digit values with zero", () => {
    const date = new Date(2026, 0, 1, 1, 2);
    const pad = (n: number) => String(n).padStart(2, "0");
    const expected = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}`;
    expect(fileStamp(date)).toBe(expected);
  });
});
