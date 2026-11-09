/** Tests for strip geometry utilities */
import {
  photoBox,
  stripHeight,
  photoSlot,
  hitTestSticker,
  STRIP_W,
  PHOTO_GAP,
  MAX_STICKERS,
} from "@/lib/strip";
import type { StickerItem } from "@/lib/types";

describe("STRIP_W", () => {
  it("is 720", () => {
    expect(STRIP_W).toBe(720);
  });
});

describe("photoBox", () => {
  it("returns width and height based on pad", () => {
    const box = photoBox(32);
    expect(box.w).toBe(STRIP_W - 64);
    expect(box.h).toBeCloseTo(box.w / (4 / 3));
  });

  it("height is width / PHOTO_ASPECT", () => {
    const box = photoBox(14);
    expect(box.h).toBeCloseTo(box.w / (4 / 3));
  });
});

describe("stripHeight", () => {
  it("includes two pads, footer, and 3 photos with gaps", () => {
    const pad = 32;
    const { h } = photoBox(pad);
    const expected = pad * 2 + 96 + h * 3 + PHOTO_GAP * 2;
    expect(stripHeight(pad)).toBe(expected);
  });
});

describe("photoSlot", () => {
  it("returns slot with correct x, y, w, h", () => {
    const pad = 32;
    const { h } = photoBox(pad);
    const slot0 = photoSlot(0, pad);
    expect(slot0.x).toBe(pad);
    expect(slot0.y).toBe(pad);
    expect(slot0.w).toBe(STRIP_W - pad * 2);
    expect(slot0.h).toBe(h);

    const slot1 = photoSlot(1, pad);
    expect(slot1.y).toBe(pad + h + PHOTO_GAP);
  });
});

describe("hitTestSticker", () => {
  const baseSticker: StickerItem = {
    uid: "test-1",
    kind: "emoji",
    x: 0.5,
    y: 0.5,
    size: 0.2,
    rotation: 0,
  };

  it("returns null when no stickers", () => {
    expect(hitTestSticker([], 100, 100, 1000)).toBeNull();
  });

  it("returns the sticker when point is within bounds", () => {
    // center of strip at STRIP_W=720, stripH=1000 => x=360, y=500
    const result = hitTestSticker([baseSticker], 360, 500, 1000);
    expect(result).toBe(baseSticker);
  });

  it("returns null when point is outside sticker bounds", () => {
    const result = hitTestSticker([baseSticker], 700, 500, 1000);
    expect(result).toBeNull();
  });

  it("respects MAX_STICKERS constant", () => {
    expect(MAX_STICKERS).toBe(14);
  });
});
