import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CheckListService } from '../../services/check-list-service';
import { CheckListDto } from '../../models';

// Interfaces frontend pour ajouter la propriété 'reponse'
interface QuestionFrontend {
  id?: number;
  texte: string;
  type: 'Boolean' | 'BooleanNA' | 'Texte' | 'Liste';
  options: { id?: number; valeur: string }[];
  reponse?: string;
}

interface EtapeFrontend {
  id?: number;
  nom: string;
  questions: QuestionFrontend[];
}

interface CheckListFrontend {
  id?: number;
  libelle: string;
  etapes: EtapeFrontend[];
}

@Component({
  selector: 'app-checklist-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checklist-detail.html',
  styleUrls: ['./checklist-detail.css']
})
export class CheckListDetailComponent implements OnInit {
  checklist: CheckListFrontend | null = null;
  loading = true;
  totalQuestions = 0;

  constructor(
    private route: ActivatedRoute,
    private checklistService: CheckListService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? +idParam : null;

    if (id !== null) {
      this.loadCheckList(id);
    } else {
      console.error('Aucun ID de checklist trouvé dans l’URL');
      this.loading = false;
    }
  }

  loadCheckList(id: number): void {
    this.checklistService.getCheckList(id).subscribe({
      next: (data: CheckListDto) => {
        // Mapper backend -> frontend en ajoutant 'reponse' vide
        this.checklist = {
          id: data.id,
          libelle: data.libelle,
          etapes: data.etapes?.map(e => ({
            id: e.id,
            nom: e.nom,
            questions: e.questions?.map(q => ({
              id: q.id,
              texte: q.texte,
              type: ['Boolean', 'BooleanNA', 'Texte', 'Liste'].includes(q.type) ? (q.type as QuestionFrontend['type']) : 'Boolean',
              options: q.options?.map(o => ({ id: o.id, valeur: o.valeur })) || [],
              reponse: ''
            })) || []
          })) || []
        };

        // Calcul total questions
        this.totalQuestions = this.checklist.etapes.reduce(
          (sum, e) => sum + (e.questions?.length || 0),
          0
        );

        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement de la checklist :', err);
        this.loading = false;
      }
    });
  }

getBooleanOptions(question: QuestionFrontend): string[] {
  return question.type === 'BooleanNA' ? ['Oui', 'Non', 'N/A'] : ['Oui', 'Non'];
}

}
