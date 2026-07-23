import { Injectable, signal } from '@angular/core';

/** Oblíbené produkty (v reálu by se ukládaly k účtu uživatele). */
@Injectable({ providedIn: 'root' })
export class OblibeneService {
  private readonly _ids = signal<Set<string>>(new Set());
  readonly ids = this._ids.asReadonly();

  je(id: string) {
    return this._ids().has(id);
  }

  prepnout(id: string) {
    this._ids.update((set) => {
      const novy = new Set(set);
      novy.has(id) ? novy.delete(id) : novy.add(id);
      return novy;
    });
  }
}
