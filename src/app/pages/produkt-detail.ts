import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmBreadcrumbImports } from '@spartan-ng/helm/breadcrumb';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { CartService } from '../cart.service';
import { KATEGORIE, PRODUKTY } from '../data';
import { Stitek } from '../models';
import { PridatDoKosiku } from '../shared/pridat-do-kosiku';

@Component({
  selector: 'app-produkt-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    RouterLink,
    HlmBadgeImports,
    HlmBreadcrumbImports,
    HlmButtonImports,
    HlmCardImports,
    HlmDialogImports,
    HlmSeparatorImports,
    PridatDoKosiku,
  ],
  template: `
    @if (produkt(); as p) {
      <div class="mx-auto w-full max-w-5xl px-4 py-6">
        <!-- Drobečková navigace -->
        <nav hlmBreadcrumb class="mb-5">
          <ol hlmBreadcrumbList>
            <li hlmBreadcrumbItem>
              <a hlmBreadcrumbLink routerLink="/">Katalog</a>
            </li>
            <li hlmBreadcrumbSeparator></li>
            <li hlmBreadcrumbItem>
              <a hlmBreadcrumbLink routerLink="/" [queryParams]="{ kategorie: p.kategorieId }">
                {{ nazevKategorie() }}
              </a>
            </li>
            <li hlmBreadcrumbSeparator></li>
            <li hlmBreadcrumbItem>
              <span hlmBreadcrumbPage>{{ p.nazev }}</span>
            </li>
          </ol>
        </nav>

        <div class="grid gap-8 md:grid-cols-2">
          <!-- Galerie -->
          <div>
            <hlm-dialog>
              <button
                hlmDialogTrigger
                class="block w-full cursor-zoom-in rounded-lg border bg-white"
                aria-label="Zvětšit obrázek"
              >
                <div class="aspect-square w-full p-6">
                  <img [src]="aktivniObrazek()" [alt]="p.nazev" class="h-full w-full object-contain" />
                </div>
              </button>
              <hlm-dialog-content *hlmDialogPortal class="max-w-[min(92vw,56rem)]">
                <img [src]="aktivniObrazek()" [alt]="p.nazev" class="max-h-[80vh] w-full object-contain" />
              </hlm-dialog-content>
            </hlm-dialog>

            @if (p.obrazky.length > 1) {
              <div class="mt-3 flex gap-2">
                @for (o of p.obrazky; track o; let i = $index) {
                  <button
                    class="h-20 w-20 rounded-md border bg-white p-1 transition-colors"
                    [class.border-primary]="i === aktivniIndex()"
                    (click)="aktivniIndex.set(i)"
                  >
                    <img [src]="o" alt="" class="h-full w-full object-contain" />
                  </button>
                }
              </div>
            }
          </div>

          <!-- Informace -->
          <div class="flex flex-col gap-4">
            <div class="flex flex-wrap items-center gap-2">
              @for (s of p.stitky; track s) {
                <span hlmBadge [variant]="stitekVarianta(s)">{{ stitekNazev(s) }}</span>
              }
              <span class="text-sm text-muted-foreground">Kód: {{ p.kod }}</span>
            </div>

            <h1 class="text-2xl font-bold">{{ p.nazev }}</h1>

            @if (p.popis) {
              <p class="text-muted-foreground">{{ p.popis }}</p>
            }

            <div class="text-3xl font-bold">
              {{ p.cena | number: '1.2-2' }} Kč
              <span class="block text-sm font-normal text-muted-foreground">
                bez DPH {{ p.cena / 1.21 | number: '1.2-2' }} Kč · 1 kredit = 1 Kč
              </span>
            </div>

            <p class="text-sm" [class.text-green-600]="p.skladem !== 0">
              {{ p.skladem === 'dodavatel' ? 'Skladem u dodavatele' : 'Skladem je ' + p.skladem + ' ks' }}
            </p>
            @if (p.lzePlatitKreditem) {
              <p class="text-sm text-green-600">Lze platit kreditem</p>
            }

            <app-pridat-do-kosiku [produkt]="p" />

            @if (p.dokumenty.length) {
              <hlm-separator class="my-2" />
              <div>
                <h2 class="mb-2 font-semibold">Dokumenty a podklady</h2>
                <ul class="flex flex-col gap-2">
                  @for (d of p.dokumenty; track d.nazev) {
                    <li>
                      <a
                        [href]="d.url"
                        class="flex items-center gap-2 text-sm text-primary underline-offset-4 hover:underline"
                      >
                        <span
                          class="inline-flex h-8 w-8 items-center justify-center rounded-md bg-muted text-xs font-bold uppercase"
                        >
                          {{ d.typ === 'odkaz' ? '🔗' : d.typ }}
                        </span>
                        {{ d.nazev }}
                      </a>
                    </li>
                  }
                </ul>
              </div>
            }
          </div>
        </div>
      </div>
    } @else {
      <div class="mx-auto max-w-5xl px-4 py-16 text-center">
        <p class="mb-4 text-muted-foreground">Produkt nenalezen.</p>
        <a hlmBtn routerLink="/">Zpět na katalog</a>
      </div>
    }
  `,
})
export class ProduktDetail {
  private readonly cart = inject(CartService);

  /** :id z routy (withComponentInputBinding) */
  readonly id = input.required<string>();

  protected readonly produkt = computed(() => PRODUKTY.find((p) => p.id === this.id()));
  protected readonly aktivniIndex = signal(0);
  protected readonly aktivniObrazek = computed(
    () => this.produkt()?.obrazky[this.aktivniIndex()] ?? this.produkt()?.obrazky[0],
  );

  protected readonly nazevKategorie = computed(
    () => KATEGORIE.find((k) => k.id === this.produkt()?.kategorieId)?.nazev ?? '',
  );

  protected stitekVarianta(s: Stitek): 'default' | 'destructive' | 'secondary' {
    return s === 'akce' ? 'destructive' : s === 'tip' ? 'secondary' : 'default';
  }

  protected stitekNazev(s: Stitek) {
    return s === 'novinka' ? 'Novinka' : s === 'akce' ? 'Akce' : 'Tip';
  }
}
