import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckListService, CheckListDto } from '../../services/check-list-service';

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
      this.checklists = data.map(cl => ({
        ...cl,
        questions: cl.questions.map(q => ({
          ...q,
          options: q.options || []
        }))
      }));
      this.loading = false;
    },
    error: (err) => {
      console.error(err);
      this.loading = false;
    }
  });
}

}
