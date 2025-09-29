// check-list-service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, switchMap, catchError, of, throwError, forkJoin } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CheckListDto, QuestionDto, EtapeDto,
  FormSubmissionDto, QuestionResponseDto, CreateCheckListDto
} from '../models';

// Attache des soumissions à chaque question
export interface QuestionSubmission {
  submissionId?: number;
  reponse: string;
  submittedAt?: string;
  submittedBy?: string;
}

// Vue agrégée prête à afficher
export type AggregatedChecklistDto =
  Omit<CheckListDto, 'etapes'> & {
    etapes: Array<
      Omit<EtapeDto, 'questions'> & {
        questions: Array<QuestionDto & { submissions: QuestionSubmission[] }>
      }
    >
  };

@Injectable({ providedIn: 'root' })
export class CheckListService {
  private apiUrl = `${environment.apiUrl}/CheckList`;

  // ⚠️ Ajuste selon ton API réelle
  private submissionsUrl = `${environment.apiUrl}/FormResponse`;

  constructor(private http: HttpClient) {}

  getCheckList(id: number): Observable<CheckListDto> {
    return this.http.get<CheckListDto>(`${this.apiUrl}/${id}`);
  }

  getAllCheckLists(): Observable<CheckListDto[]> { return this.http.get<CheckListDto[]>(this.apiUrl); }

  createCheckList(dto: CreateCheckListDto): Observable<CheckListDto> {
    return this.http.post<CheckListDto>(`${this.apiUrl}/with-etapes`, dto);
  }

  updateCheckList(id: number, dto: CreateCheckListDto): Observable<CheckListDto> {
    return this.http.put<CheckListDto>(`${this.apiUrl}/${id}`, dto);
  }

  deleteCheckList(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }

  /** 1) Essaye de lire les “soumissions” (si ton API les expose) */
  getChecklistSubmissions(checklistId: number): Observable<FormSubmissionDto[]> {
    const paramsA = new HttpParams().set('checkListId', String(checklistId));
    const tryA$ = this.http.get<FormSubmissionDto[]>(this.submissionsUrl, { params: paramsA })
      .pipe(catchError(err => err?.status === 404 ? of([]) : throwError(() => err)));

    // Variante paramètre différent (checklistId)
    const paramsB = new HttpParams().set('checklistId', String(checklistId));
    const tryB$ = this.http.get<FormSubmissionDto[]>(this.submissionsUrl, { params: paramsB })
      .pipe(catchError(() => of([])));

    // Variante RESTful: /CheckList/{id}/submissions
    const tryC$ = this.http.get<FormSubmissionDto[]>(`${this.apiUrl}/${checklistId}/submissions`)
      .pipe(catchError(() => of([])));

    return tryA$.pipe(
      switchMap(a => (a?.length ? of(a) : tryB$)),
      switchMap(b => (b?.length ? of(b) : tryC$))
    );
  }

  /** 2) Fallback : lire les “réponses courantes” question par question (ton JSON) */
  getLatestAnswers(checklistId: number): Observable<QuestionDto[]> {
    // Essaie 1: /Question/by-checklist/{id}
    const tryA$ = this.http.get<QuestionDto[]>(`${environment.apiUrl}/Question/by-checklist/${checklistId}`)
      .pipe(catchError(() => of([])));

    // Essaie 2: /Question?checkListId=...
    const params = new HttpParams().set('checkListId', String(checklistId));
    const tryB$ = this.http.get<QuestionDto[]>(`${environment.apiUrl}/Question`, { params })
      .pipe(catchError(() => of([])));

    // Essaie 3: /CheckList/{id}/questions
    const tryC$ = this.http.get<QuestionDto[]>(`${this.apiUrl}/${checklistId}/questions`)
      .pipe(catchError(() => of([])));

    return tryA$.pipe(
      switchMap(a => (a?.length ? of(a) : tryB$)),
      switchMap(b => (b?.length ? of(b) : tryC$))
    );
  }

  /** 3) Agrégat : Checklist + Étapes + Questions + submissions[] (soumissions OU réponses courantes) */
  getChecklistWithSubmissions(checklistId: number): Observable<AggregatedChecklistDto> {
    return this.getCheckList(checklistId).pipe(
      switchMap((cl) => {
        // Squelette agrégé + index
        const aggregated: AggregatedChecklistDto = {
          id: cl.id,
          libelle: cl.libelle,
          version: cl.version,
          description: cl.description,
          etapes: (cl.etapes || []).map(e => ({
            id: e.id,
            nom: e.nom,
            ordre: e.ordre,
            estValidee: e.estValidee,
            questions: (e.questions || []).map(q => ({ ...q, submissions: [] }))
          }))
        };

        const qIndex = new Map<number, QuestionDto & { submissions: QuestionSubmission[] }>();
        aggregated.etapes.forEach(et => et.questions.forEach(q => { if (q.id != null) qIndex.set(q.id, q); }));

        return forkJoin({
          subs: this.getChecklistSubmissions(checklistId).pipe(catchError(() => of([] as FormSubmissionDto[]))),
          answers: this.getLatestAnswers(checklistId).pipe(catchError(() => of([] as QuestionDto[])))
        }).pipe(
          map(({ subs, answers }) => {
            // 3a) Injecte les soumissions (si présentes)
            if (subs?.length) {
              for (const s of subs) {
                for (const r of (s.reponses || [] as QuestionResponseDto[])) {
                  const tgt = qIndex.get(r.questionId);
                  if (!tgt) continue;
                  tgt.submissions.push({
                    submissionId: s.id,
                    reponse: r.reponse ?? '',
                    submittedAt: s.submittedAt,
                    submittedBy: s.submittedBy
                  });
                }
              }
            }

            // 3b) Si aucune soumission trouvée, injecte les réponses courantes (fallback)
            const hasAnySubmission = Array.from(qIndex.values()).some(q => q.submissions.length > 0);
            if (!hasAnySubmission && answers?.length) {
              for (const a of answers) {
                if (!a?.id) continue;
                const tgt = qIndex.get(a.id);
                if (!tgt) continue;
                const val = (a.reponse ?? '').trim();
                if (!val) continue;
                tgt.submissions.push({ reponse: val }); // pseudo-soumission
              }
            }

            return aggregated;
          })
        );
      })
    );
  }
}
