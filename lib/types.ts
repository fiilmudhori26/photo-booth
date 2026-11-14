export type FilterId =
  | "normal"
  | "bw"
  | "vintage"
  | "pink"
  | "contrast"
  | "sepia"
  | "grain"
  | "lightleak";

export type FrameId =
  | "pink"
  | "cream"
  | "lavender"
  | "matcha"
  | "ink"
  | "white"
  | "sky"
  | "strawberry"
  | "milktea"
  | "coral"
  | "floral"
  | "retro"
  | "korean"
  | "bubblegum"
  | "mocha";

export type PatternId = "none" | "dots" | "hearts" | "stripes" | "checker";

export type ExportFormat = "png" | "jpg";

/** A single decorative element placed on the photo strip. */
export interface StickerItem {
  uid: string;
  kind: "emoji" | "date";
  emoji?: string;
  /** Normalised center position (0 - 1) relative to the strip. */
  x: number;
  y: number;
  /** Emoji glyph size as a fraction of the strip width. */
  size: number;
  /** Rotation in degrees. */
  rotation: number;
}

/** A raw camera grab, kept un-filtered so filters can be re-applied live. */
export interface CapturedShot {
  id: string;
  raw: string;
}
