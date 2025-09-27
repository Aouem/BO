import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckListService, CheckListDto, EtapeDto, QuestionDto } from '../../services/check-list-service';

@Component({
  selector: 'app-checklist-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checklist-list.html',
  styleUrls: ['./checklist-list.css']
})
export class CheckListListComponent implements OnInit {
  checklists: CheckListDto[] = [];
  loading = true;

  constructor(private checklistService: CheckListService) {}

  ngOnInit(): void {
    this.checklistService.getAllCheckLists().subscribe({
      next: (data) => {
        // S'assure que chaque étape et question a ses options définies
        this.checklists = data.map(cl => ({
          ...cl,
          etapes: cl.etapes?.map((e: EtapeDto) => ({
            ...e,
            questions: e.questions?.map((q: QuestionDto) => ({
              ...q,
              options: q.options || [],
              // Ajout d'une propriété pour savoir si N/A est présent
              hasNA: q.type === 'Boolean' && q.options?.some(o => o.valeur === 'N/A') ? true : false
            })) || []
          })) || []
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  // Getter pour afficher les options Boolean/N/A
 getBooleanOptions(q: QuestionDto): string[] {
  return q.type === 'BooleanNA' ? ['Oui', 'Non', 'N/A'] : ['Oui', 'Non'];
}

}
