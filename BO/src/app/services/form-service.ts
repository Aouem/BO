import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; // <-- importer l'environnement
import { FormResponseDto, QuestionDto } from '../models';

// DTO pour les options de réponse
/* export interface ResponseOptionDto {
  id: number;
  valeur: string;
}

// DTO pour les questions
export interface QuestionDto {
  id: number;
  texte: string;
  type: 'Boolean' | 'BooleanNA' | 'Liste' | 'Texte';
  options?: ResponseOptionDto[];
  reponse?: string;
  etapeId: number;
  etapeNom?: string;      // ← Doit être présent
  checkListId?: number;
  checkListLibelle?: string;
  estObligatoire?: boolean;
}

// DTO pour envoyer la réponse d’une question
export interface QuestionResponseDto {
  questionId: number;
  reponse?: string;
}

// DTO pour envoyer le formulaire complet
export interface FormResponseDto {
  checkListId: number;
  reponses: QuestionResponseDto[];
}
 */
@Injectable({
  providedIn: 'root'
})
export class FormService {

  private baseUrl = `${environment.apiUrl}/Question`; // <-- utilisation de environment.apiUrl

  constructor(private http: HttpClient) { }

  getQuestionsByChecklist(checklistId: number): Observable<QuestionDto[]> {
    return this.http.get<QuestionDto[]>(`${this.baseUrl}/by-checklist/${checklistId}`);
  }

  getQuestionsByEtape(etapeId: number): Observable<QuestionDto[]> {
    return this.http.get<QuestionDto[]>(`${this.baseUrl}/by-etape/${etapeId}`);
  }

  getQuestionById(questionId: number): Observable<QuestionDto> {
    return this.http.get<QuestionDto>(`${this.baseUrl}/${questionId}`);
  }

  createQuestion(question: QuestionDto): Observable<QuestionDto> {
    return this.http.post<QuestionDto>(this.baseUrl, question);
  }

  updateQuestion(questionId: number, question: QuestionDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${questionId}`, question);
  }

  deleteQuestion(questionId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${questionId}`);
  }

  submitForm(formData: FormResponseDto): Observable<any> {
    return this.http.post(`${this.baseUrl}/submit-form`, formData);
  }
}
