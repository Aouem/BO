import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CheckListService } from '../../services/check-list-service';
import { CheckListDto } from '../../models';

@Component({
  selector: 'app-checklist-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checklist-form.html',
  styleUrls: ['./checklist-form.css']
})
export class CheckListFormComponent implements OnInit {
  form: FormGroup;
  checklists: CheckListDto[] = [];
  loading = true;
  formSubmitted = false;
    selectedChecklist: CheckListDto | null = null;


  constructor(private fb: FormBuilder, private checklistService: CheckListService) {
    this.form = this.fb.group({
      libelle: ['', Validators.required],
      etapes: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadChecklists();

    // ➕ Ajouter une étape et une question vide au démarrage
    if (this.etapes.length === 0) {
      this.addEtape();
      this.addQuestion(0);
    }
  }

  // --- GETTERS ---
  get etapes(): FormArray {
    return this.form.get('etapes') as FormArray;
  }

  getQuestions(etapeIndex: number): FormArray {
    return this.etapes.at(etapeIndex).get('questions') as FormArray;
  }

  getOptions(etapeIndex: number, questionIndex: number): FormArray {
    return this.getQuestions(etapeIndex).at(questionIndex).get('options') as FormArray;
  }

  // --- LOAD CHECKLISTS ---
  loadChecklists(): void {
    this.checklistService.getAllCheckLists().subscribe({
      next: (data: CheckListDto[] | null) => {
        this.checklists = data?.filter(cl => cl != null) || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des checklists :', err);
        this.loading = false;
      }
    });
  }
  selectChecklist(cl: CheckListDto): void {
    this.selectedChecklist = cl;
  }

  clearSelection(): void {
    this.selectedChecklist = null;
  }

  // --- ETAPES ---
  addEtape(): void {
    const etape = this.fb.group({
      nom: ['', Validators.required],
      questions: this.fb.array([])
    });
    this.etapes.push(etape);
  }

  removeEtape(index: number): void {
    this.etapes.removeAt(index);
  }

  // --- QUESTIONS ---
  addQuestion(etapeIndex: number, type: string = 'Boolean'): void {
    const question = this.fb.group({
      texte: ['', Validators.required],
      type: [type, Validators.required],
      reponse: [''],
      options: this.fb.array([])
    });
    this.getQuestions(etapeIndex).push(question);
  }

  removeQuestion(etapeIndex: number, questionIndex: number): void {
    this.getQuestions(etapeIndex).removeAt(questionIndex);
  }

  // --- OPTIONS (Liste) ---
  addOption(etapeIndex: number, questionIndex: number): void {
    const option = this.fb.group({ valeur: [''] });
    this.getOptions(etapeIndex, questionIndex).push(option);
  }

  removeOption(etapeIndex: number, questionIndex: number, optionIndex: number): void {
    this.getOptions(etapeIndex, questionIndex).removeAt(optionIndex);
  }

  // --- TYPE BOOLEAN / BOOLEANNA ---
  getBooleanOptions(type: string): string[] {
    return type === 'BooleanNA' ? ['Oui', 'Non', 'N/A'] : ['Oui', 'Non'];
  }

  onTypeChange(etapeIndex: number, questionIndex: number): void {
    const question = this.getQuestions(etapeIndex).at(questionIndex) as FormGroup;

    // Reset options si ce n’est pas une liste
    if (question.get('type')?.value !== 'Liste') {
      question.setControl('options', this.fb.array([]));
    }

    // Reset la réponse
    question.patchValue({ reponse: '' });
  }

  // --- SUBMIT ---
  onSubmit(): void {
    if (this.form.valid) {
      console.log('Valeur du formulaire :', this.form.value);
      this.formSubmitted = true;

      // API call
      // this.checklistService.createCheckList(this.form.value).subscribe(...)
    } else {
      console.warn('Formulaire invalide', this.form.value);
      this.form.markAllAsTouched();
    }
  }


  
}
