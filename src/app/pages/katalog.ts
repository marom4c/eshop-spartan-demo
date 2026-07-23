import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { KATEGORIE, PRODUKTY } from '../data';
import { Stitek } from '../models';
import { PridatDoKosiku } from '../shared/pridat-do-kosiku';

@Component({
  selector: 'app-katalog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    FormsModule,
    RouterLink,
    HlmBadgeImports,
    HlmButtonImports,
    HlmCardImports,
    HlmCheckboxImports,
    HlmInputImports,
    HlmLabelImports,
    HlmSelectImports,
    PridatDoKosiku,
  ],
  template: `
    <div class="mx-auto flex w-full max-w-7xl gap-6 px-4 py-6">
      <!-- Kategorie: postranní panel (desktop) -->
      <aside class="hidden w-60 shrink-0 md:block">
        <h2 class="mb-3 text-sm font-semibold tracking-wide uppercase text-muted-foreground">Kategorie</h2>
        <nav class="flex flex-col gap-1">
          <button
            hlmBtn
            [variant]="kategorie() === null ? 'secondary' : 'ghost'"
            size="sm"
            class="justify-start"
            (click)="kategorie.set(null)"
          >
            Všechny kategorie
          </button>
          @for (k of kategorieSeznam; track k.id) {
            <button
              hlmBtn
              [variant]="kategorie() === k.id ? 'secondary' : 'ghost'"
              size="sm"
              class="justify-start text-left whitespace-normal"
              (click)="kategorie.set(k.id)"
            >
              {{ k.nazev }}
            </button>
          }
        </nav>
      </aside>

      <div class="min-w-0 flex-1">
        <!-- Filtry -->
        <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            hlmInput
            type="search"
            placeholder="Hledat produkt…"
            class="w-full sm:max-w-xs"
            [ngModel]="hledat()"
            (ngModelChange)="hledat.set($event)"
          />

          <!-- Kategorie: select (mobil) -->
          <div class="md:hidden">
            <hlm-select [ngModel]="kategorie()" (ngModelChange)="kategorie.set($event)" [itemToString]="nazevKategorie">
              <hlm-select-trigger class="w-full">
                <hlm-select-value placeholder="Všechny kategorie" />
              </hlm-select-trigger>
              <hlm-select-content *hlmSelectPortal>
                <hlm-select-item [value]="null">Všechny kategorie</hlm-select-item>
                @for (k of kategorieSeznam; track k.id) {
                  <hlm-select-item [value]="k.id">{{ k.nazev }}</hlm-select-item>
                }
              </hlm-select-content>
            </hlm-select>
          </div>

          <div class="flex items-center gap-4">
            @for (s of stitky; track s.id) {
              <label hlmLabel class="flex items-center gap-2">
                <hlm-checkbox [checked]="filtrStitku().has(s.id)" (checkedChange)="prepnoutStitek(s.id)" />
                {{ s.nazev }}
              </label>
            }
          </div>
        </div>

        <!-- Produkty -->
        <p class="mb-3 text-sm text-muted-foreground">{{ vysledky().length }} produktů</p>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          @for (p of vysledky(); track p.id) {
            <div hlmCard class="flex flex-col overflow-hidden pt-0">
              <a [routerLink]="['/produkt', p.id]" class="relative block bg-white">
                <div class="aspect-square w-full p-4">
                  <img [src]="p.obrazky[0]" [alt]="p.nazev" class="h-full w-full object-contain" />
                </div>
                @if (p.stitky.length) {
                  <div class="absolute top-2 left-2 flex gap-1">
                    @for (s of p.stitky; track s) {
                      <span hlmBadge [variant]="stitekVarianta(s)">{{ stitekNazev(s) }}</span>
                    }
                  </div>
                }
              </a>
              <div hlmCardContent class="flex flex-1 flex-col gap-2">
                <a [routerLink]="['/produkt', p.id]" class="line-clamp-2 font-medium hover:underline">
                  {{ p.nazev }}
                </a>
                <p class="text-xs text-muted-foreground">
                  {{ p.skladem === 'dodavatel' ? 'Skladem u dodavatele' : 'Skladem ' + p.skladem + ' ks' }}
                </p>
                <div class="mt-auto flex items-center justify-between gap-2 pt-2">
                  <span class="text-lg font-bold">{{ p.cena | number: '1.2-2' }} Kč</span>
                  <app-pridat-do-kosiku [produkt]="p" velikost="sm" />
                </div>
              </div>
            </div>
          } @empty {
            <p class="col-span-full py-10 text-center text-muted-foreground">
              Žádný produkt neodpovídá filtru.
            </p>
          }
        </div>
      </div>
    </div>
  `,
})
export class Katalog {
  protected readonly kategorieSeznam = KATEGORIE;
  protected readonly stitky = [
    { id: 'novinka' as Stitek, nazev: 'Novinka' },
    { id: 'akce' as Stitek, nazev: 'Akce' },
    { id: 'tip' as Stitek, nazev: 'Tip' },
  ];

  protected readonly hledat = signal('');
  protected readonly kategorie = signal<string | null>(null);
  protected readonly filtrStitku = signal<Set<Stitek>>(new Set());

  protected readonly vysledky = computed(() => {
    const q = this.hledat().toLowerCase().trim();
    const kat = this.kategorie();
    const stitky = this.filtrStitku();
    return PRODUKTY.filter(
      (p) =>
        (!kat || p.kategorieId === kat) &&
        (!q || p.nazev.toLowerCase().includes(q) || p.kod.toLowerCase().includes(q)) &&
        (stitky.size === 0 || p.stitky.some((s) => stitky.has(s))),
    );
  });

  protected readonly nazevKategorie = (id: string | null) =>
    KATEGORIE.find((k) => k.id === id)?.nazev ?? 'Všechny kategorie';

  protected prepnoutStitek(s: Stitek) {
    this.filtrStitku.update((set) => {
      const novy = new Set(set);
      novy.has(s) ? novy.delete(s) : novy.add(s);
      return novy;
    });
  }

  protected stitekVarianta(s: Stitek): 'default' | 'destructive' | 'secondary' {
    return s === 'akce' ? 'destructive' : s === 'tip' ? 'secondary' : 'default';
  }

  protected stitekNazev(s: Stitek) {
    return s === 'novinka' ? 'Novinka' : s === 'akce' ? 'Akce' : 'Tip';
  }
}
