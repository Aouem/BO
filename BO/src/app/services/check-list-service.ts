import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CheckListDto, CreateCheckListDto } from '../models';

// DTO pour poster les questions avec options
/* export interface CreateResponseOptionDto {
  id?: number; 
  valeur: string;
} */

/* export interface CreateQuestionDto {
  texte: string;
  type: string; // "Boolean" | "Liste" | "Texte"
  options?: CreateResponseOptionDto[];
  reponse?: string; // facultatif pour stocker la réponse
} */

/* export interface CreateEtapeDto {
  nom: string;
  questions: CreateQuestionDto[];
} */

/* export interface CreateCheckListDto {
  libelle: string;
  etapes: CreateEtapeDto[]; // <-- ici on utilise "etapes" comme côté backend
}

// DTO pour récupérer depuis le backend
export interface ResponseOptionDto {
  id: number;
  valeur: string;
}

export interface QuestionDto {
  id: number;
  texte: string;
  type: string;
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
  nom: string; // <-- Le nom est bien présent ici
  ordre: number;
  questions: QuestionDto[];
  estValidee: boolean;
}

export interface CheckListDto {
  id: number;
  libelle: string;
  version: string;
  description: string;
  etapes: EtapeDto[]; // <-- Structure complète avec étapes
} */

@Injectable({
  providedIn: 'root'
})
export class CheckListService {
  private apiUrl = `${environment.apiUrl}/CheckList`;

  constructor(private http: HttpClient) {}

  getCheckList(id: number): Observable<CheckListDto> {
    return this.http.get<CheckListDto>(`${this.apiUrl}/${id}`);
  }

  getAllCheckLists(): Observable<CheckListDto[]> {
    return this.http.get<CheckListDto[]>(this.apiUrl);
  }

  createCheckList(dto: CreateCheckListDto): Observable<CheckListDto> {
    return this.http.post<CheckListDto>(`${this.apiUrl}/with-etapes`, dto);
  }

  // --- NOUVELLE MÉTHODE POUR LA MISE À JOUR ---
// Changer la signature de la méthode update
updateCheckList(id: number, dto: CreateCheckListDto): Observable<CheckListDto> {
  return this.http.put<CheckListDto>(`${this.apiUrl}/${id}`, dto);
}

  deleteCheckList(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}