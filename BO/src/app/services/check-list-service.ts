import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// DTO pour poster les questions avec options
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
  type: string; // "Boolean" | "Liste" | "Texte"
  options: ResponseOptionDto[];
}

export interface EtapeDto {
  id: number;
  nom: string;
  questions: QuestionDto[];
}

export interface CheckListDto {
  id: number;
  libelle: string;
  etapes: EtapeDto[]; // <-- correspond au backend
}

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
  updateCheckList(id: number, dto: CreateCheckListDto): Observable<CheckListDto> {
    return this.http.put<CheckListDto>(`${this.apiUrl}/${id}`, dto);
  }

  deleteCheckList(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}