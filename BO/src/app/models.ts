// === INTERFACES DE BASE (Lecture) ===
export interface ResponseOptionDto {
  id: number;
  valeur: string;
}

export interface QuestionDto {
  id: number;
  texte: string;
  type: 'Boolean' | 'BooleanNA' | 'Liste' | 'Texte';
  estObligatoire: boolean;
  reponse: string | null;
  commentaire: string | null;
  options: ResponseOptionDto[];
  etapeId: number;
  checkListId: number;
  checkListLibelle: string | null;
}

export interface EtapeDto {
  id: number;
  nom: string;
  ordre: number;
  questions: QuestionDto[];
  estValidee: boolean;
}

// === INTERFACE DE BASE POUR CHECKLIST ===
export interface CheckListBaseDto {
  libelle: string;
  etapes: EtapeDto[];
}

// === INTERFACES SPÉCIALISÉES ===
export interface CheckListDto extends CheckListBaseDto {
  id: number;
  version: string;
  description: string;
}

// === INTERFACES POUR LA CRÉATION (Écriture) ===
export interface CreateResponseOptionDto {
  id?: number; 
  valeur: string;
}

export interface CreateQuestionDto {
  texte: string;
  type: string; // "Boolean" | "Liste" | "Texte"
  options?: CreateResponseOptionDto[];
  reponse?: string; // facultatif pour stocker la réponse
}

export interface CreateEtapeDto {
  nom: string;
  questions: CreateQuestionDto[];
}

export interface CreateCheckListDto {
  libelle: string;
  etapes: CreateEtapeDto[];
}

// === INTERFACES POUR LES RÉPONSES DU FORMULAIRE ===
export interface QuestionResponseDto {
  questionId: number;
  reponse?: string;
}

export interface FormResponseDto {
  checkListId: number;
  reponses: QuestionResponseDto[];
}