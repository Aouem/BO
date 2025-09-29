import { QuestionDto } from "../models";
import { ResponseOption } from "./ResponseOption";

export interface Question {
  texte: string;
  type: 'Boolean' | 'BooleanNA' | 'Texte' | 'Liste';
  options?: ResponseOption[];
  hasNA?: boolean;
  reponse?: string;
  id?: number;
}

export interface QuestionWithResponse extends Question {}

// Fonction utilitaire pour convertir QuestionDto (backend) en Question (frontend)
export function mapQuestionDtoToQuestion(q: QuestionDto): QuestionWithResponse {
  let strictType: Question['type'] = 'Boolean';
  if (q.type === 'Boolean' || q.type === 'BooleanNA' || q.type === 'Texte' || q.type === 'Liste') {
    strictType = q.type;
  }

  return {
    ...q,
    type: strictType,
    options: q.options || [],
    reponse: '',
    id: q.id
  };
}
