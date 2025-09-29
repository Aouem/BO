// check-list-detail.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CheckListService, AggregatedChecklistDto } from '../../services/check-list-service';

type EtapeAgg = AggregatedChecklistDto['etapes'][number];
type QuestionAgg = EtapeAgg['questions'][number];
type SubmissionAgg = QuestionAgg['submissions'][number];

@Component({
  selector: 'app-checklist-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checklist-detail.html',
  styleUrls: ['./checklist-detail.css']
})
export class CheckListDetailComponent implements OnInit {
  loading = true;
  errorMsg = '';
  agg: AggregatedChecklistDto | null = null;

  constructor(
    private route: ActivatedRoute,
    private checklists: CheckListService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? +idParam : 0;

    if (!id) {
      this.errorMsg = 'Aucun ID de checklist trouvé dans l’URL';
      this.loading = false;
      return;
    }

    this.checklists.getChecklistWithSubmissions(id).subscribe({
      next: (agg) => { this.agg = agg; this.loading = false; },
      error: (err) => { 
        console.error('Erreur checklist', err); 
        this.errorMsg = 'Impossible de charger la checklist.'; 
        this.loading = false; 
      }
    });
  }

  // ------------------------------
  // Résumé / comptages
  // ------------------------------
  get hasRealSubmissions(): boolean {
    if (!this.agg) return false;
    return this.agg.etapes.some(et =>
      et.questions.some(q => (q.submissions || []).some(s => s.submissionId != null))
    );
  }

  get headerCountLabel(): string {
    return this.hasRealSubmissions ? 'soumission(s)' : 'réponse(s)';
  }

  get totalSubmissions(): number {
    if (!this.agg) return 0;

    const submissionIds = new Set<number>();
    let pseudoCount = 0;

    for (const et of this.agg.etapes) {
      for (const q of et.questions) {
        const subs = q.submissions || [];
        if (!subs.length) continue;

        let hasReal = false;
        for (const s of subs) {
          if (s.submissionId != null) {
            hasReal = true;
            submissionIds.add(s.submissionId);
          }
        }
        if (!hasReal) {
          // S'il n'y a que des réponses "sans id", on compte 1 par question
          pseudoCount += 1;
        }
      }
    }

    return submissionIds.size > 0 ? submissionIds.size : pseudoCount;
  }

  // Pour information (si tu veux afficher un breakdown par question)
  summaryFor(question: { submissions: Array<{ reponse?: string }> }) {
    const res = { oui: 0, non: 0, na: 0 };
    for (const s of question.submissions || []) {
      const v = (s.reponse || '').trim();
      if (v === 'Oui') res.oui++;
      else if (v === 'Non') res.non++;
      else if (v.toUpperCase() === 'N/A' || v === 'NA') res.na++;
    }
    return res;
  }

  // ------------------------------
  // Helpers UI
  // ------------------------------
  badgeClass(val?: string) {
    const v = (val || '').trim();
    if (v === 'Oui') return 'badge bg-success';
    if (v === 'Non') return 'badge bg-danger';
    if (v.toUpperCase() === 'N/A' || v === 'NA') return 'badge bg-secondary';
    return 'badge bg-secondary';
  }

  hasMeta(s: { submissionId?: number; submittedBy?: string; submittedAt?: string }) {
    return !!(s.submissionId != null || s.submittedBy || s.submittedAt);
  }

  // ------------------------------
  // Dernière réponse d'une question
  // ------------------------------
  latest(q: QuestionAgg): SubmissionAgg | null {
    const arr = q.submissions || [];
    if (!arr.length) return null;

    // Trier par date si présente (desc)
    const withDate = arr.some(s => !!s.submittedAt);
    if (withDate) {
      const clone = [...arr].sort((a, b) => {
        const ta = a.submittedAt ? new Date(a.submittedAt).getTime() : -1;
        const tb = b.submittedAt ? new Date(b.submittedAt).getTime() : -1;
        return tb - ta; // plus récent en premier
      });
      return clone[0];
    }

    // Sinon: prendre le dernier élément saisi
    return arr[arr.length - 1];
  }

  isLatest(q: QuestionAgg, val: 'Oui' | 'Non' | 'N/A'): boolean {
    const last = this.latest(q);
    if (!last || !last.reponse) return false;
    const v = (last.reponse || '').trim().toUpperCase();
    if (val === 'N/A') return v === 'N/A' || v === 'NA';
    return v === val.toUpperCase();
  }

  // ------------------------------
  // Aplatir toutes les soumissions
  // ------------------------------
  get flatSubmissions(): Array<{
    etape: string;
    question: string;
    reponse: string;
    submittedBy?: string;
    submittedAt?: string;
    submissionId?: number | null;
  }> {
    const rows: Array<{
      etape: string; question: string; reponse: string;
      submittedBy?: string; submittedAt?: string; submissionId?: number | null;
    }> = [];

    if (!this.agg) return rows;

    for (const et of this.agg.etapes) {
      for (const q of et.questions) {
        for (const s of (q.submissions || [])) {
          rows.push({
            etape: et.nom,
            question: q.texte,
            reponse: s.reponse || '',
            submittedBy: s.submittedBy,
            submittedAt: s.submittedAt,
            submissionId: s.submissionId ?? null
          });
        }
      }
    }

    // Tri: plus récent -> plus ancien, puis alphabétique
    rows.sort((a, b) => {
      const ta = a.submittedAt ? new Date(a.submittedAt).getTime() : -1;
      const tb = b.submittedAt ? new Date(b.submittedAt).getTime() : -1;
      if (tb !== ta) return tb - ta;
      const aKey = (a.etape + '|' + a.question).toLowerCase();
      const bKey = (b.etape + '|' + b.question).toLowerCase();
      return aKey.localeCompare(bKey);
    });

    return rows;
  }

  // ------------------------------
  // trackBy
  // ------------------------------
  trackByEt = (_: number, et: EtapeAgg) => et.id ?? _;
  trackByQ = (_: number, q: QuestionAgg) => q.id ?? _;
  trackByS = (_: number, s: SubmissionAgg) => s.submissionId ?? _;
  trackByFlat = (_: number, r: {
    etape: string; question: string; reponse: string;
    submittedAt?: string; submissionId?: number | null;
  }) => (r.submissionId != null ? 's' + r.submissionId : `q:${r.etape}|${r.question}|${r.reponse}|${r.submittedAt ?? ''}`);
}
