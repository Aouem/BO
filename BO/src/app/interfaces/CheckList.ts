import { Question } from "./Question";

export interface CheckList {
  libelle: string;
  questions: Question[];
}