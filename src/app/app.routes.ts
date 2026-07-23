import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/katalog').then((m) => m.Katalog) },
  { path: 'produkt/:id', loadComponent: () => import('./pages/produkt-detail').then((m) => m.ProduktDetail) },
  { path: 'kosik', loadComponent: () => import('./pages/kosik').then((m) => m.Kosik) },
  { path: '**', redirectTo: '' },
];
