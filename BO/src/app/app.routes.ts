import { Routes } from '@angular/router';
import { CheckListFormComponent } from './components/checklist-form/checklist-form';
import { CheckListListComponent } from './components/checklist-list/checklist-list';

export const routes: Routes = [
  // Liste de toutes les checklists
  { path: 'checklists', component: CheckListListComponent },

  // Formulaire pour créer ou éditer une checklist
  { path: 'checklist/new', component: CheckListFormComponent },
  { path: 'checklist/:id', component: CheckListFormComponent },

  // Redirection par défaut vers la liste
  { path: '', redirectTo: '/checklists', pathMatch: 'full' },

  // Route wildcard pour tout ce qui n'existe pas
  { path: '**', redirectTo: '/checklists' }
];
