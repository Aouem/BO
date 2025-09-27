import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CheckListService, CheckListDto, EtapeDto, QuestionDto, ResponseOptionDto } from '../../services/check-list-service';
import { Question } from '../../interfaces/Question';

// --- Interfaces frontend ---
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
  selector: 'app-checklist-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checklist-list.html',
  styleUrls: ['./checklist-list.css']
})
export class CheckListListComponent implements OnInit {
  checklists: CheckListFrontend[] = [];
  loading = true;

  constructor(private checklistService: CheckListService) {}

  ngOnInit(): void {
    this.loadChecklists();
  }

  // --- Charger les checklists depuis le backend ---
  loadChecklists(): void {
    this.checklistService.getAllCheckLists().subscribe({
      next: (data: CheckListDto[]) => {
        this.checklists = data.map(cl => ({
          id: cl.id,
          libelle: cl.libelle,
          etapes: cl.etapes?.map(e => ({
            id: e.id,
            nom: e.nom,
            questions: e.questions?.map(q => ({
              id: q.id,
              texte: q.texte,
              type: ['Boolean', 'BooleanNA', 'Texte', 'Liste'].includes(q.type) ? q.type as QuestionFrontend['type'] : 'Boolean',
              options: q.options?.map(o => ({ id: o.id, valeur: o.valeur })) || [],
              reponse: ''
            })) || []
          })) || []
        }));
        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  // --- Étapes ---
  addEtape(checklist: CheckListFrontend) {
    if (!checklist.etapes) checklist.etapes = [];
    checklist.etapes.push({
      id: 0,
      nom: '',
      questions: []
    });
  }

  removeEtape(checklist: CheckListFrontend, index: number) {
    checklist.etapes.splice(index, 1);
  }

  updateEtapeNom(etape: EtapeFrontend, value: string) {
    etape.nom = value;
  }

  // --- Questions ---
  addQuestion(etape: EtapeFrontend) {
    etape.questions.push({
      id: 0,
      texte: '',
      type: 'Boolean',
      options: [],
      reponse: ''
    });
  }

  removeQuestion(etape: EtapeFrontend, index: number) {
    etape.questions.splice(index, 1);
  }

  updateQuestionTexte(question: QuestionFrontend, value: string) {
    question.texte = value;
  }

  updateQuestionType(question: QuestionFrontend, value: string) {
    question.type = value as QuestionFrontend['type'];
    if (value !== 'Liste') question.options = [];
    if (!question.reponse) question.reponse = '';
  }

  addOption(question: QuestionFrontend) {
    question.options.push({ valeur: '' });
  }

  removeOption(question: QuestionFrontend, index: number) {
    question.options.splice(index, 1);
  }

  getBooleanOptions(q: QuestionFrontend): string[] {
    return q.type === 'BooleanNA' ? ['Oui', 'Non', 'N/A'] : ['Oui', 'Non'];
  }

  // --- Sauvegarder checklist ---
  saveChecklist(checklist: CheckListFrontend) {
    // Mapper frontend -> DTO backend
    const payload: CheckListDto = {
      id: checklist.id || 0,
      libelle: checklist.libelle,
      etapes: checklist.etapes.map(e => ({
        id: e.id || 0,
        nom: e.nom,
        questions: e.questions.map(q => ({
          id: q.id || 0,
          texte: q.texte,
          type: q.type,
          options: q.options.map(o => ({
            id: o.id || 0,
            valeur: o.valeur
          }))
        }))
      }))
    };

    this.checklistService.createCheckList(payload).subscribe({
      next: res => console.log('Checklist sauvegardée', res),
      error: err => console.error(err)
    });
  }
  // --- Nouveau handler pour contenteditable ---
onBlurLibelle(event: Event, cl: any) {
  const target = event.target as HTMLElement | null;
  if (target) {
    cl.libelle = target.textContent || '';
  }
}

// --- Nouveau handler pour select type de question ---
updateQuestionTypeSafe(question: Question, newType: string) {
  question.type = newType as Question['type'];
  if (newType !== 'Liste') question.options = [];
  if (!question.reponse) question.reponse = '';
}


}
