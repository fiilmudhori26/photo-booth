/** Canvas renderers for photo booth templates — index module.
 *
 * Each template lives in its own file under lib/templates/*.render.ts.
 * Slot geometry helpers live in lib/templates/slots.ts.
 * This module only assembles TEMPLATE_LIST and exports getTemplate.
 */
import type { PhotoBoothTemplate, TemplateRenderOptions } from "./templates";
import { renderBoardingPass } from "./templates/boarding-pass.render";
import { renderVintageMovie } from "./templates/vintage-movie.render";
import { renderModernGraphic } from "./templates/modern-graphic.render";
import { renderAirMail } from "./templates/air-mail.render";
import { renderTheaterTicket } from "./templates/theater-ticket.render";
import {
  slots2x2,
  slotsVertical,
  slotsStaggered,
  slotsDual,
  W,
  H,
} from "./templates/slots";

export const TEMPLATE_LIST: PhotoBoothTemplate[] = [
  {
    id: "boarding-pass",
    name: "Boarding Pass",
    aspectRatio: W / 800,
    designWidth: W,
    exportScale: 1,
    photoSlots: slots2x2(),
    render: renderBoardingPass,
  },
  {
    id: "vintage-movie",
    name: "Vintage Movie Ticket",
    aspectRatio: 3 / 4,
    designWidth: W,
    exportScale: 1,
    photoSlots: slotsVertical(4),
    render: renderVintageMovie,
  },
  {
    id: "modern-graphic",
    name: "Modern Graphic",
    aspectRatio: 3 / 4,
    designWidth: W,
    exportScale: 1,
    photoSlots: slotsStaggered(8),
    render: renderModernGraphic,
  },
  {
    id: "air-mail",
    name: "Air Mail Postal",
    aspectRatio: 3 / 4,
    designWidth: W,
    exportScale: 1,
    photoSlots: slotsDual(8, 4),
    render: renderAirMail,
  },
  {
    id: "theater-ticket",
    name: "Theater Show Ticket",
    aspectRatio: 3 / 4,
    designWidth: W,
    exportScale: 1,
    photoSlots: slotsDual(8, 4),
    render: renderTheaterTicket,
  },
];

export function getTemplate(id: string): PhotoBoothTemplate {
  return TEMPLATE_LIST.find((t) => t.id === id) ?? TEMPLATE_LIST[0];
}
