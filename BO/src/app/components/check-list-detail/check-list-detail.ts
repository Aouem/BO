// ...imports existants...
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CheckListService, AggregatedChecklistDto } from '../../services/check-list-service';

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
      error: (err) => { console.error('Erreur checklist', err); this.errorMsg = 'Impossible de charger la checklist.'; this.loading = false; }
    });
  }

  // ----- Résumé / comptages -----
  get hasRealSubmissions(): boolean {
    if (!this.agg) return false;
    return this.agg.etapes.some(et =>
      et.questions.some(q => q.submissions?.some(s => s.submissionId != null))
    );
  }

  get headerCountLabel(): string {
    // Si on a de "vraies" soumissions (avec submissionId), on parle de soumissions,
    // sinon on parle de réponses (valeurs courantes).
    return this.hasRealSubmissions ? 'soumission(s)' : 'réponse(s)';
  }

  get totalSubmissions(): number {
    if (!this.agg) return 0;

    const submissionIds = new Set<number>();
    let pseudoCount = 0;

    this.agg.etapes.forEach(et =>
      et.questions.forEach(q => {
        if (!q.submissions?.length) return;
        // vraies soumissions
        q.submissions.forEach(s => {
          if (s.submissionId != null) submissionIds.add(s.submissionId);
        });
        // si uniquement pseudo-soumissions (pas d'id), on compte 1 par question
        if (q.submissions.every(s => s.submissionId == null)) {
          pseudoCount += 1;
        }
      })
    );

    return submissionIds.size > 0 ? submissionIds.size : pseudoCount;
  }

  // Résumé Oui/Non/N/A par question
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

  // ----- UI helpers -----
  badgeClass(val?: string) {
    const v = (val || '').trim();
    if (v === 'Oui') return 'badge bg-success';
    if (v === 'Non') return 'badge bg-danger';
    if (v.toUpperCase() === 'N/A' || v === 'NA') return 'badge bg-secondary';
    return 'badge bg-secondary';
  }

  // Affiche un petit meta texte seulement si au moins une info est présente
  // (id, auteur, date). Sinon on ne montre rien.
  hasMeta(s: { submissionId?: number; submittedBy?: string; submittedAt?: string }) {
    return !!(s.submissionId != null || s.submittedBy || s.submittedAt);
  }

  // ----- trackBy -----
  trackByEt = (_: number, et: any) => et.id ?? _;
  trackByQ = (_: number, q: any) => q.id ?? _;
  trackByS = (_: number, s: any) => s.submissionId ?? _; // pseudo-soumissions n'ont pas d'id
}
