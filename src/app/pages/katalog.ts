import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideHeart } from '@ng-icons/lucide';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { CartService } from '../cart.service';
import { KATEGORIE, PRODUKTY } from '../data';
import { Produkt, Stitek } from '../models';
import { OblibeneService } from '../oblibene.service';
import { PridatDoKosiku } from '../shared/pridat-do-kosiku';

type Razeni = 'vychozi' | 'nejlevnejsi' | 'nejdrazsi' | 'nazev';

@Component({
  selector: 'app-katalog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    FormsModule,
    RouterLink,
    NgIcon,
    HlmBadgeImports,
    HlmButtonImports,
    HlmCardImports,
    HlmCheckboxImports,
    HlmInputImports,
    HlmLabelImports,
    HlmSelectImports,
    PridatDoKosiku,
  ],
  providers: [provideIcons({ lucideHeart })],
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
            class="justify-between"
            (click)="kategorie.set(null)"
          >
            Všechny kategorie
            <span class="text-xs text-muted-foreground">{{ produkty.length }}</span>
          </button>
          @for (k of kategorieSeznam; track k.id) {
            @if (pocetVKategorii(k.id); as pocet) {
              <button
                hlmBtn
                [variant]="kategorie() === k.id ? 'secondary' : 'ghost'"
                size="sm"
                class="justify-between text-left whitespace-normal"
                (click)="kategorie.set(k.id)"
              >
                <span class="min-w-0 flex-1">{{ k.nazev }}</span>
                <span class="text-xs text-muted-foreground">{{ pocet }}</span>
              </button>
            }
          }
        </nav>
      </aside>

      <div class="min-w-0 flex-1">
        <!-- Filtry a řazení -->
        <div class="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
          <input
            hlmInput
            type="search"
            placeholder="Hledat název nebo kód…"
            class="w-full lg:max-w-xs"
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

          <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
            @for (s of stitky; track s.id) {
              <label hlmLabel class="flex items-center gap-2">
                <hlm-checkbox [checked]="filtrStitku().has(s.id)" (checkedChange)="prepnoutStitek(s.id)" />
                {{ s.nazev }}
              </label>
            }
            <label hlmLabel class="flex items-center gap-2">
              <hlm-checkbox [checked]="jenOblibene()" (checkedChange)="jenOblibene.set(!jenOblibene())" />
              ♥ Oblíbené
            </label>
          </div>

          <div class="lg:ms-auto">
            <hlm-select [ngModel]="razeni()" (ngModelChange)="razeni.set($event)" [itemToString]="nazevRazeni">
              <hlm-select-trigger class="w-full lg:w-44">
                <hlm-select-value placeholder="Řadit…" />
              </hlm-select-trigger>
              <hlm-select-content *hlmSelectPortal>
                <hlm-select-item value="vychozi">Doporučené</hlm-select-item>
                <hlm-select-item value="nejlevnejsi">Od nejlevnějšího</hlm-select-item>
                <hlm-select-item value="nejdrazsi">Od nejdražšího</hlm-select-item>
                <hlm-select-item value="nazev">Podle názvu</hlm-select-item>
              </hlm-select-content>
            </hlm-select>
          </div>
        </div>

        <!-- Produkty -->
        <p class="mb-3 text-sm text-muted-foreground">{{ vysledky().length }} produktů</p>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          @for (p of vysledky(); track p.id) {
            <div hlmCard class="group flex flex-col overflow-hidden pt-0 transition-shadow hover:shadow-md">
              <div class="relative">
                <a [routerLink]="['/produkt', p.id]" class="block bg-white">
                  <div class="aspect-square w-full p-4">
                    <img
                      [src]="p.obrazky[0]"
                      [alt]="p.nazev"
                      class="h-full w-full object-contain transition-transform duration-200 group-hover:scale-105"
                    />
                  </div>
                </a>
                @if (p.stitky.length) {
                  <div class="absolute top-2 left-2 flex gap-1">
                    @for (s of p.stitky; track s) {
                      <span hlmBadge [variant]="stitekVarianta(s)">{{ stitekNazev(s) }}</span>
                    }
                  </div>
                }
                <button
                  hlmBtn
                  variant="ghost"
                  size="icon-sm"
                  class="absolute top-2 right-2 rounded-full bg-white/80"
                  [class.text-red-500]="oblibene.je(p.id)"
                  (click)="oblibene.prepnout(p.id)"
                  [attr.aria-label]="oblibene.je(p.id) ? 'Odebrat z oblíbených' : 'Přidat do oblíbených'"
                >
                  <ng-icon name="lucideHeart" [class.fill-current]="oblibene.je(p.id)" />
                </button>
              </div>
              <div hlmCardContent class="flex flex-1 flex-col gap-2">
                <a [routerLink]="['/produkt', p.id]" class="line-clamp-2 font-medium hover:underline">
                  {{ p.nazev }}
                </a>
                <p class="flex items-center gap-1.5 text-xs" [class]="skladBarva(p)">
                  <span class="inline-block h-2 w-2 rounded-full bg-current"></span>
                  {{ skladText(p) }}
                </p>
                <div class="mt-auto flex items-center justify-between gap-2 pt-2">
                  <span class="text-lg font-bold" [class.text-destructive]="p.stitky.includes('akce')">
                    {{ p.cena | number: '1.2-2' }} Kč
                  </span>
                  <app-pridat-do-kosiku [produkt]="p" velikost="sm" />
                </div>
              </div>
            </div>
          } @empty {
            <div class="col-span-full py-14 text-center text-muted-foreground">
              <p class="mb-3">Žádný produkt neodpovídá filtru.</p>
              <button hlmBtn variant="outline" size="sm" (click)="vycistitFiltry()">Zrušit filtry</button>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class Katalog {
  protected readonly cart = inject(CartService);
  protected readonly oblibene = inject(OblibeneService);

  protected readonly produkty = PRODUKTY;
  protected readonly kategorieSeznam = KATEGORIE;
  protected readonly stitky = [
    { id: 'novinka' as Stitek, nazev: 'Novinka' },
    { id: 'akce' as Stitek, nazev: 'Akce' },
    { id: 'tip' as Stitek, nazev: 'Tip' },
  ];

  protected readonly hledat = signal('');
  protected readonly kategorie = signal<string | null>(null);
  protected readonly filtrStitku = signal<Set<Stitek>>(new Set());
  protected readonly jenOblibene = signal(false);
  protected readonly razeni = signal<Razeni>('vychozi');

  protected readonly vysledky = computed(() => {
    const q = this.hledat().toLowerCase().trim();
    const kat = this.kategorie();
    const stitky = this.filtrStitku();
    const obl = this.jenOblibene() ? this.oblibene.ids() : null;
    const vysledek = PRODUKTY.filter(
      (p) =>
        (!kat || p.kategorieId === kat) &&
        (!q || p.nazev.toLowerCase().includes(q) || p.kod.toLowerCase().includes(q)) &&
        (stitky.size === 0 || p.stitky.some((s) => stitky.has(s))) &&
        (!obl || obl.has(p.id)),
    );
    switch (this.razeni()) {
      case 'nejlevnejsi':
        return [...vysledek].sort((a, b) => a.cena - b.cena);
      case 'nejdrazsi':
        return [...vysledek].sort((a, b) => b.cena - a.cena);
      case 'nazev':
        return [...vysledek].sort((a, b) => a.nazev.localeCompare(b.nazev, 'cs'));
      default:
        return vysledek;
    }
  });

  protected pocetVKategorii(id: string) {
    return PRODUKTY.filter((p) => p.kategorieId === id).length;
  }

  protected readonly nazevKategorie = (id: string | null) =>
    KATEGORIE.find((k) => k.id === id)?.nazev ?? 'Všechny kategorie';

  protected readonly nazevRazeni = (r: Razeni) =>
    ({ vychozi: 'Doporučené', nejlevnejsi: 'Od nejlevnějšího', nejdrazsi: 'Od nejdražšího', nazev: 'Podle názvu' })[r] ??
    'Doporučené';

  protected prepnoutStitek(s: Stitek) {
    this.filtrStitku.update((set) => {
      const novy = new Set(set);
      novy.has(s) ? novy.delete(s) : novy.add(s);
      return novy;
    });
  }

  protected vycistitFiltry() {
    this.hledat.set('');
    this.kategorie.set(null);
    this.filtrStitku.set(new Set());
    this.jenOblibene.set(false);
  }

  protected skladText(p: Produkt) {
    if (p.skladem === 'dodavatel') return 'Skladem u dodavatele';
    if (p.skladem <= 5) return `Poslední kusy (${p.skladem} ks)`;
    return `Skladem ${p.skladem} ks`;
  }

  protected skladBarva(p: Produkt) {
    if (p.skladem === 'dodavatel') return 'text-amber-600';
    if (p.skladem <= 5) return 'text-destructive';
    return 'text-green-600';
  }

  protected stitekVarianta(s: Stitek): 'default' | 'destructive' | 'secondary' {
    return s === 'akce' ? 'destructive' : s === 'tip' ? 'secondary' : 'default';
  }

  protected stitekNazev(s: Stitek) {
    return s === 'novinka' ? 'Novinka' : s === 'akce' ? 'Akce' : 'Tip';
  }
}
