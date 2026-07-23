import { Injectable, computed, signal } from '@angular/core';
import { PolozkaKosiku, Produkt } from './models';

@Injectable({ providedIn: 'root' })
export class CartService {
  /** zůstatek kreditů uživatele (1 kredit = 1 Kč) — v reálu přijde z backendu */
  readonly kredity = signal(1500);

  private readonly _polozky = signal<PolozkaKosiku[]>([]);
  readonly polozky = this._polozky.asReadonly();

  readonly pocetKusu = computed(() =>
    this._polozky().reduce((s, p) => s + p.mnozstvi, 0),
  );

  readonly celkem = computed(() =>
    this._polozky().reduce((s, p) => s + p.mnozstvi * p.produkt.cena, 0),
  );

  pridat(produkt: Produkt, mnozstvi: number, varianta?: string, poznamka?: string) {
    this._polozky.update((polozky) => {
      const existujici = polozky.find(
        (p) => p.produkt.id === produkt.id && p.varianta === varianta && p.poznamka === poznamka,
      );
      if (existujici) {
        return polozky.map((p) =>
          p === existujici ? { ...p, mnozstvi: p.mnozstvi + mnozstvi } : p,
        );
      }
      return [...polozky, { produkt, mnozstvi, varianta, poznamka }];
    });
  }

  zmenitMnozstvi(polozka: PolozkaKosiku, mnozstvi: number) {
    if (mnozstvi <= 0) {
      this.odebrat(polozka);
      return;
    }
    this._polozky.update((polozky) =>
      polozky.map((p) => (p === polozka ? { ...p, mnozstvi } : p)),
    );
  }

  odebrat(polozka: PolozkaKosiku) {
    this._polozky.update((polozky) => polozky.filter((p) => p !== polozka));
  }

  vyprazdnit() {
    this._polozky.set([]);
  }
}
