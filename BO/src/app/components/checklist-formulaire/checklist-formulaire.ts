import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormService } from '../../services/form-service';
import { CheckListService } from '../../services/check-list-service'; // <-- Importer CheckListService
import { CommonModule } from '@angular/common';
import { CheckListDto, EtapeDto, FormResponseDto, QuestionDto, QuestionResponseDto } from '../../models';

@Component({
  selector: 'app-checklist-formulaire',
  templateUrl: './checklist-formulaire.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styleUrls: ['./checklist-formulaire.css']
})
export class ChecklistFormulaireComponent implements OnInit {
  checklistId: number = 8; // Exemple : checklist 8
  checklistNom: string = '';
  etapes: EtapeDto[] = [];
  form!: FormGroup;
  loading: boolean = false;
  submitted: boolean = false;

  constructor(
    private formService: FormService,
    private checkListService: CheckListService, // <-- Injecter CheckListService
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({});
    this.loadChecklist();
  }

  loadChecklist() {
    this.loading = true;

    // ✅ UTILISER CheckListService au lieu de FormService
    this.checkListService.getCheckList(this.checklistId).subscribe({
      next: (checklist: CheckListDto) => {
        this.checklistNom = checklist.libelle;
        this.etapes = checklist.etapes; // <-- Les étapes avec leurs noms sont déjà incluses

        this.buildForm();
        this.loading = false;

        console.log("Checklist :", this.checklistNom);
        console.log("Étapes :", this.etapes);
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement de la checklist', err);
        this.loading = false;
      }
    });
  }

  getBooleanOptions(type: string): string[] {
    return type === 'BooleanNA' ? ['Oui', 'Non', 'N/A'] : ['Oui', 'Non'];
  }

  buildForm() {
    this.etapes.forEach(etape => {
      etape.questions.forEach(q => {
        let control: FormControl;
        switch (q.type) {
          case 'Boolean':
          case 'BooleanNA':
            control = this.fb.control(
              null, 
              q.estObligatoire ? Validators.required : null
            );
            break;
          case 'Liste':
            control = this.fb.control(q.reponse || null, Validators.required);
            break;
          case 'Texte':
            control = this.fb.control(q.reponse || '', Validators.required);
            break;
          default:
            control = this.fb.control(q.reponse || '');
        }
        this.form.addControl('question_' + q.id, control);
      });
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const responses: QuestionResponseDto[] = [];
    this.etapes.forEach(etape => {
      etape.questions.forEach(q => {
        responses.push({
          questionId: q.id,
          reponse: this.form.get('question_' + q.id)?.value
        });
      });
    });

    const formData: FormResponseDto = {
      checkListId: this.checklistId,
      reponses: responses
    };

    this.formService.submitForm(formData).subscribe({
      next: () => {
        this.submitted = true;
        console.log('Formulaire soumis avec succès !', formData);
      },
      error: (err: any) => {
        console.error('Erreur lors de la soumission', err);
      }
    });
  }

  trackByEtapeId(index: number, etape: EtapeDto): number {
    return etape.id;
  }

  trackByQuestionId(index: number, question: QuestionDto): number {
    return question.id;
  }
}