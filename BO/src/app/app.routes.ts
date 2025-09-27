import { Routes } from '@angular/router';
import { CheckListFormComponent } from './components/checklist-form/checklist-form';
import { CheckListListComponent } from './components/checklist-list/checklist-list';

export const routes: Routes = [
  // Liste de toutes les checklists
  { path: 'checklists', component: CheckListListComponent },

  // Formulaire pour créer une checklist
  { path: 'checklists/new', component: CheckListFormComponent },

  // Formulaire pour afficher/éditer une checklist par ID
  { path: 'checklists/:id', component: CheckListFormComponent },

  // Redirection par défaut vers la liste
  { path: '', redirectTo: '/checklists', pathMatch: 'full' },

  // Route wildcard pour tout ce qui n'existe pas
  { path: '**', redirectTo: '/checklists' }
];
