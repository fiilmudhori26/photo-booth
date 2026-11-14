import type { FrameId, PatternId } from "./types";

export interface FrameTheme {
  id: FrameId;
  label: string;
  /** Base gradient stops for the frame body. */
  bg: string;
  bg2: string;
  /** Caption / title colour. */
  ink: string;
  /** Secondary (date) colour. */
  inkSoft: string;
  /** Decoration colour used by the pattern overlays. */
  patternInk: string;
  /** Small transparent wash drawn behind each photo. */
  photoBack: string;
  /** Colour shown in the swatch button. */
  swatch: string;
}

export const FRAMES: FrameTheme[] = [
  {
    id: "pink",
    label: "Peach Pink",
    bg: "#FBCFE8",
    bg2: "#FEE2E2",
    ink: "#8E3B69",
    inkSoft: "#B26C90",
    patternInk: "#F9A8D4",
    photoBack: "rgba(255,255,255,0.75)",
    swatch: "#FBCFE8",
  },
  {
    id: "cream",
    label: "Creamy Yellow",
    bg: "#FEF3C7",
    bg2: "#FFFBEB",
    ink: "#8B6A1D",
    inkSoft: "#B79A55",
    patternInk: "#FDE68A",
    photoBack: "rgba(255,255,255,0.78)",
    swatch: "#FEF3C7",
  },
  {
    id: "lavender",
    label: "Lavender",
    bg: "#E9D5FF",
    bg2: "#F3E8FF",
    ink: "#67469B",
    inkSoft: "#9A7BC4",
    patternInk: "#DDD6FE",
    photoBack: "rgba(255,255,255,0.75)",
    swatch: "#E9D5FF",
  },
  {
    id: "matcha",
    label: "Matcha Green",
    bg: "#DCFCE7",
    bg2: "#ECFDF5",
    ink: "#3F6B4A",
    inkSoft: "#6D9A79",
    patternInk: "#BBF7D0",
    photoBack: "rgba(255,255,255,0.78)",
    swatch: "#DCFCE7",
  },
  {
    id: "ink",
    label: "Midnight",
    bg: "#3B2F45",
    bg2: "#2A2233",
    ink: "#FDF2F8",
    inkSoft: "#D8BEE0",
    patternInk: "#57465F",
    photoBack: "rgba(253,242,248,0.85)",
    swatch: "#3B2F45",
  },
  {
    id: "white",
    label: "Cloud White",
    bg: "#FFFFFF",
    bg2: "#FFF5F8",
    ink: "#7B5566",
    inkSoft: "#AE8B9B",
    patternInk: "#FCE7F3",
    photoBack: "rgba(251,207,232,0.3)",
    swatch: "#FFFFFF",
  },
  {
    id: "sky",
    label: "Sky Blue",
    bg: "#BAE6FD",
    bg2: "#EAF6FF",
    ink: "#2F5D7C",
    inkSoft: "#6E9BB6",
    patternInk: "#7DD3FC",
    photoBack: "rgba(255,255,255,0.78)",
    swatch: "#BAE6FD",
  },
  {
    id: "strawberry",
    label: "Strawberry Milk",
    bg: "#F9B8CE",
    bg2: "#FFF0F4",
    ink: "#9E3358",
    inkSoft: "#C77A96",
    patternInk: "#F78DAE",
    photoBack: "rgba(255,255,255,0.8)",
    swatch: "#F9B8CE",
  },
  {
    id: "milktea",
    label: "Milk Tea",
    bg: "#E8D5C4",
    bg2: "#FAF3EC",
    ink: "#6B5140",
    inkSoft: "#9C8375",
    patternInk: "#D3B8A2",
    photoBack: "rgba(255,255,255,0.8)",
    swatch: "#E8D5C4",
  },
  {
    id: "floral",
    label: "Floral Blush",
    bg: "#FDE8F0",
    bg2: "#FFF5FA",
    ink: "#6E2F4C",
    inkSoft: "#A86B8B",
    patternInk: "#F6B8CD",
    photoBack: "rgba(255,255,255,0.78)",
    swatch: "#FDE8F0",
  },
  {
    id: "retro",
    label: "Retro Film",
    bg: "#EDE0C8",
    bg2: "#DCCFAC",
    ink: "#463322",
    inkSoft: "#7E6A50",
    patternInk: "#CDB98F",
    photoBack: "rgba(255,255,255,0.72)",
    swatch: "#EDE0C8",
  },
  {
    id: "korean",
    label: "Korean Cream",
    bg: "#FAF7EF",
    bg2: "#EDE7DA",
    ink: "#474440",
    inkSoft: "#837E73",
    patternInk: "#DCD4C3",
    photoBack: "rgba(255,255,255,0.85)",
    swatch: "#FAF7EF",
  },
  {
    id: "bubblegum",
    label: "Bubblegum",
    bg: "#FFD1EC",
    bg2: "#FFE9F7",
    ink: "#71285E",
    inkSoft: "#A95694",
    patternInk: "#FF9ED5",
    photoBack: "rgba(255,255,255,0.78)",
    swatch: "#FFD1EC",
  },
  {
    id: "mocha",
    label: "Mocha Royale",
    bg: "#D9C2AC",
    bg2: "#F1E5D8",
    ink: "#4A3423",
    inkSoft: "#7E6650",
    patternInk: "#C4A582",
    photoBack: "rgba(255,255,255,0.75)",
    swatch: "#D9C2AC",
  },
  {
    id: "coral",
    label: "Coral Sunset",
    bg: "#FFC9B0",
    bg2: "#FFEDE3",
    ink: "#A8503C",
    inkSoft: "#C9846F",
    patternInk: "#FFB08F",
    photoBack: "rgba(255,255,255,0.78)",
    swatch: "#FFC9B0",
  },
];

export const DEFAULT_FRAME: FrameId = "pink";

export function getFrame(id: FrameId): FrameTheme {
  return FRAMES.find((f) => f.id === id) ?? FRAMES[0];
}

export interface PatternPreset {
  id: PatternId;
  label: string;
  icon: string;
}

export const PATTERNS: PatternPreset[] = [
  { id: "none", label: "Plain", icon: "🤍" },
  { id: "dots", label: "Polka", icon: "⚪" },
  { id: "hearts", label: "Hearts", icon: "💕" },
  { id: "stripes", label: "Ribbon", icon: "🎀" },
  { id: "checker", label: "Picnic", icon: "🏁" },
];
