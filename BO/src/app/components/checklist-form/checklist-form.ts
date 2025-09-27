// checklist-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CheckListService, CreateCheckListDto } from '../../services/check-list-service';

export interface ResponseOption {
  valeur: string;
}

@Component({
  selector: 'app-checklist-form',
  templateUrl: './checklist-form.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styleUrls: ['./checklist-form.css']
})
export class CheckListFormComponent implements OnInit {
  form!: FormGroup;
  loading = false;

  constructor(private fb: FormBuilder, private checklistService: CheckListService) {}

  ngOnInit(): void {
    this.initForm();
  }

  // Initialisation du formulaire
  initForm() {
    this.form = this.fb.group({
      libelle: ['', Validators.required],
      questions: this.fb.array([])
    });
  }

  // Getter pour le FormArray questions
  get questions(): FormArray {
    return this.form.get('questions') as FormArray;
  }

  // Ajouter une nouvelle question
  addQuestion() {
    const questionGroup = this.fb.group({
      texte: ['', Validators.required],
      type: ['Boolean', Validators.required],
      options: this.fb.array([]), // Tableau d’options si Liste
      reponse: ['']
    });
    this.questions.push(questionGroup);
  }

  // Supprimer une question
  removeQuestion(index: number) {
    this.questions.removeAt(index);
  }

  // Getter pour les options d’une question
  getOptions(questionIndex: number): FormArray {
    return this.questions.at(questionIndex).get('options') as FormArray;
  }

  // Ajouter une option à une question de type Liste
  addOption(questionIndex: number) {
    this.getOptions(questionIndex).push(this.fb.group({ valeur: ['', Validators.required] }));
  }

  // Supprimer une option
  removeOption(questionIndex: number, optionIndex: number) {
    this.getOptions(questionIndex).removeAt(optionIndex);
  }

  // Quand le type de question change
  onTypeChange(index: number) {
    const q = this.questions.at(index);
    if (q.get('type')?.value !== 'Liste') {
      (q.get('options') as FormArray).clear();
    }
  }

  // Soumission du formulaire
  onSubmit() {
    if (this.form.invalid) return;

    const dto: CreateCheckListDto = {
      libelle: this.form.value.libelle,
      questions: this.form.value.questions.map((q: any) => ({
        texte: q.texte,
        type: q.type,
        options: q.options?.map((o: ResponseOption) => ({ valeur: o.valeur })) || [],
        reponse: q.reponse || ''
      }))
    };

    console.log('DTO à envoyer :', dto);
    this.loading = true;

    this.checklistService.createCheckList(dto).subscribe({
      next: res => {
        console.log('Checklist créée:', res);
        this.loading = false;
        this.form.reset();
        this.questions.clear();
      },
      error: err => {
        console.error(err);
        this.loading = false;
      }
    });
  }
}
