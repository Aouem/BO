import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CheckListService, CheckListDto, CreateCheckListDto } from '../../services/check-list-service';

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
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './checklist-list.html',
  styleUrls: ['./checklist-list.css']
})
export class CheckListListComponent implements OnInit {
  checklists: CheckListFrontend[] = [];
  filteredChecklists: CheckListFrontend[] = [];
  loading = true;
  searchTerm: string = '';

  constructor(
    private checklistService: CheckListService,
    private router: Router
  ) {}

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
        this.filteredChecklists = [...this.checklists];
        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  // --- Filtre de recherche ---
  filterChecklists(): void {
    if (!this.searchTerm.trim()) {
      this.filteredChecklists = [...this.checklists];
      return;
    }

    const searchLower = this.searchTerm.toLowerCase().trim();
    
    this.filteredChecklists = this.checklists.filter(checklist => 
      checklist.libelle.toLowerCase().includes(searchLower) ||
      checklist.etapes.some(etape => 
        etape.nom.toLowerCase().includes(searchLower) ||
        etape.questions.some(question => 
          question.texte.toLowerCase().includes(searchLower)
        )
      )
    );
  }

  // --- Réinitialiser la recherche ---
  clearSearch(): void {
    this.searchTerm = '';
    this.filteredChecklists = [...this.checklists];
  }

  // --- Obtenir le nombre total de questions d'une checklist ---
  getTotalQuestions(checklist: CheckListFrontend): number {
    return checklist.etapes.reduce((total, etape) => total + etape.questions.length, 0);
  }

  // --- Obtenir le nombre total d'étapes d'une checklist ---
  getTotalEtapes(checklist: CheckListFrontend): number {
    return checklist.etapes.length;
  }

  // --- Navigation vers la page détail d'une checklist ---
  viewChecklistDetail(checklistId: number): void {
    this.router.navigate(['/checklists', checklistId]);
  }

  // --- Navigation vers l'édition d'une checklist ---
  editChecklist(checklistId: number): void {
    this.router.navigate(['/checklists', checklistId, 'edit']);
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
// --- Sauvegarder checklist ---
saveChecklist(checklist: CheckListFrontend) {
  // Mapper frontend -> DTO backend pour la création/mise à jour
  const payload: CreateCheckListDto = {
    libelle: checklist.libelle,
    etapes: checklist.etapes.map(e => ({
      nom: e.nom,
      questions: e.questions.map(q => ({
        texte: q.texte,
        type: q.type,
        options: q.options.map(o => ({
          valeur: o.valeur
        }))
      }))
    }))
  };

  if (checklist.id && checklist.id > 0) {
    // ✅ MISE À JOUR de la checklist existante
    this.checklistService.updateCheckList(checklist.id, payload).subscribe({
      next: (res: CheckListDto) => {
        console.log('Checklist mise à jour avec succès', res);
        
        // Mettre à jour la checklist dans la liste locale
        const index = this.checklists.findIndex(cl => cl.id === checklist.id);
        if (index !== -1) {
          this.checklists[index] = {
            ...this.checklists[index],
            libelle: res.libelle,
            etapes: res.etapes.map(e => ({
              id: e.id,
              nom: e.nom,
              questions: e.questions.map(q => ({
                id: q.id,
                texte: q.texte,
                type: q.type as QuestionFrontend['type'],
                options: q.options.map(o => ({ id: o.id, valeur: o.valeur })),
                reponse: ''
              }))
            }))
          };
          this.filteredChecklists = [...this.checklists];
        }
        
        alert('Checklist mise à jour avec succès !');
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour:', err);
        alert('Erreur lors de la mise à jour de la checklist');
      }
    });
  } else {
    // ✅ CRÉATION d'une nouvelle checklist
    this.checklistService.createCheckList(payload).subscribe({
      next: (res: CheckListDto) => {
        console.log('Checklist créée avec succès', res);
        // Recharger la liste après création
        this.loadChecklists();
        alert('Checklist créée avec succès !');
      },
      error: (err) => {
        console.error('Erreur lors de la création:', err);
        alert('Erreur lors de la création de la checklist');
      }
    });
  }
}

  // --- Nouveau handler pour contenteditable ---
  onBlurLibelle(event: Event, cl: any) {
    const target = event.target as HTMLElement | null;
    if (target) {
      cl.libelle = target.textContent || '';
    }
  }

  // --- Nouveau handler pour select type de question ---
  updateQuestionTypeSafe(question: QuestionFrontend, newType: string) {
    question.type = newType as QuestionFrontend['type'];
    if (newType !== 'Liste') question.options = [];
    if (!question.reponse) question.reponse = '';
  }

  // --- Supprimer checklist ---
  deleteChecklist(checklist: CheckListFrontend) {
    if (!checklist.id) return; // Sécurité si pas d'id
    if (!confirm(`Voulez-vous vraiment supprimer la checklist "${checklist.libelle}" ?`)) return;

    this.checklistService.deleteCheckList(checklist.id).subscribe({
      next: () => {
        // Retirer la checklist supprimée de la liste locale
        this.checklists = this.checklists.filter(cl => cl.id !== checklist.id);
        this.filteredChecklists = this.filteredChecklists.filter(cl => cl.id !== checklist.id);
        console.log(`Checklist "${checklist.libelle}" supprimée.`);
      },
      error: (err) => {
        console.error('Erreur lors de la suppression :', err);
      }
    });
  }

  // --- Créer une nouvelle checklist ---
  createNewChecklist(): void {
    this.router.navigate(['/checklists/new']);
  }
}