import { ResponseOption } from "./ResponseOption";

export interface Question {
  texte: string;
  type: string; // "Liste", "Texte"
  options?: ResponseOption[];
}