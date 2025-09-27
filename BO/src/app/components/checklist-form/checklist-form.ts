import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CheckListDto, CheckListService, QuestionDto } from '../../services/check-list-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-checklist-form',
  templateUrl: './checklist-form.html',
   imports: [
    CommonModule,       // nécessaire pour *ngIf, *ngFor
    ReactiveFormsModule // nécessaire pour formGroup, formControlName
  ],
  styleUrls: ['./checklist-form.css']
})
export class CheckListFormComponent implements OnInit {
  form: FormGroup;
    checklists: CheckListDto[] = []; // <-- déclaration nécessaire
  loading = true; // <-- déclaration ici
  formSubmitted = false;

  constructor(private fb: FormBuilder, private checklistService: CheckListService) {
    this.form = this.fb.group({
      libelle: ['', Validators.required],
      etapes: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.initForm();
        this.loadChecklists(); // méthode pour récupérer les checklists

    this.addEtape();         // Étape par défaut
    this.addQuestion(0);     // Question par défaut dans la première étape
  }

  // Initialisation du formulaire
  initForm(): void {
    this.form = this.fb.group({
      libelle: ['', Validators.required],
      etapes: this.fb.array([])
    });
  }

  // Getter pour les étapes
  get etapes(): FormArray {
    return this.form.get('etapes') as FormArray;
  }


  loadChecklists() {
    this.checklistService.getAllCheckLists().subscribe({
      next: data => {
        this.checklists = data;
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.loading = false;
      }
    });
  }
  // Méthode pour récupérer les questions d'une étape
  getQuestions(etapeIndex: number): FormArray {
    return this.etapes.at(etapeIndex).get('questions') as FormArray;
  }

  // Méthode pour récupérer les options d'une question de type Liste
  getOptions(etapeIndex: number, questionIndex: number): FormArray {
    return this.getQuestions(etapeIndex).at(questionIndex).get('options') as FormArray;
  }

  // Ajouter une étape
  addEtape(): void {
    const etape = this.fb.group({
      nom: ['', Validators.required],
      questions: this.fb.array([])
    });
    this.etapes.push(etape);
  }

  // Supprimer une étape
  removeEtape(index: number): void {
    this.etapes.removeAt(index);
  }

  // Ajouter une question
  addQuestion(etapeIndex: number): void {
    const question = this.fb.group({
      texte: ['', Validators.required],
      type: ['Boolean', Validators.required],
      options: this.fb.array([]) // uniquement pour type Liste
    });
    this.getQuestions(etapeIndex).push(question);
  }

  // Supprimer une question
  removeQuestion(etapeIndex: number, questionIndex: number): void {
    this.getQuestions(etapeIndex).removeAt(questionIndex);
  }

  // Ajouter une option pour une question de type Liste
  addOption(etapeIndex: number, questionIndex: number): void {
    const option = this.fb.group({
      valeur: ['']
    });
    this.getOptions(etapeIndex, questionIndex).push(option);
  }

  // Supprimer une option
  removeOption(etapeIndex: number, questionIndex: number, optionIndex: number): void {
    this.getOptions(etapeIndex, questionIndex).removeAt(optionIndex);
  }

  // Méthode utilisée dans le template pour les questions Boolean / BooleanNA
  getBooleanOptions(q: QuestionDto): string[] {
    return q.type === 'BooleanNA' ? ['Oui', 'Non', 'N/A'] : ['Oui', 'Non'];
  }

  // Soumission du formulaire
  onSubmit(): void {
    if (this.form.valid) {
      console.log(this.form.value);
      this.formSubmitted = true;
      // Ici tu peux appeler ton service pour enregistrer la checklist
      // this.checklistService.createCheckList(this.form.value).subscribe(...)
    } else {
      console.log('Formulaire invalide');
    }
  }

  // Gérer le changement de type pour afficher/masquer options
onTypeChange(etapeIndex: number, questionIndex: number): void {
  const question = this.getQuestions(etapeIndex).at(questionIndex) as FormGroup;
  if (question.get('type')?.value !== 'Liste') {
    // Supprime les options si le type n'est pas Liste
    question.setControl('options', this.fb.array([]));
  }
}

}
