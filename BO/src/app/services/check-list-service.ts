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

export interface CreateCheckListDto {
  libelle: string;
  questions: CreateQuestionDto[];
}

// DTO pour récupérer depuis le backend
export interface QuestionDto {
  id: number;
  texte: string;
  type: string; // "Boolean" | "Liste" | "Texte"
  options: { id: number; valeur: string }[];
}

export interface CheckListDto {
  id: number;
  libelle: string;
  questions: QuestionDto[];
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
    return this.http.post<CheckListDto>(`${this.apiUrl}/with-questions`, dto);
  }
}
