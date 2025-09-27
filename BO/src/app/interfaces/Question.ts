import { ResponseOption } from "./ResponseOption";

export interface Question {
  texte: string;
  type: 'Boolean' | 'BooleanNA' | 'Texte' | 'Liste'; // types de question
  options?: ResponseOption[]; // uniquement pour Liste
  hasNA?: boolean; // facultatif pour indiquer si N/A est présent
}