import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMinus, lucidePlus, lucideShoppingCart, lucideTrash2 } from '@ng-icons/lucide';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { HlmSheetImports } from '@spartan-ng/helm/sheet';
import { HlmToaster } from '@spartan-ng/helm/sonner';
import { CartService } from './cart.service';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    RouterLink,
    RouterOutlet,
    NgIcon,
    HlmBadgeImports,
    HlmButtonImports,
    HlmSeparatorImports,
    HlmSheetImports,
    HlmToaster,
  ],
  providers: [provideIcons({ lucideShoppingCart, lucidePlus, lucideMinus, lucideTrash2 })],
  template: `
    <header class="sticky top-0 z-40 bg-primary text-primary-foreground shadow-sm">
      <div class="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <a routerLink="/" class="flex items-center gap-3">
          <span class="text-2xl font-black tracking-tight">E‑SHOP</span>
          <span class="hidden text-sm italic sm:block">Nakupujte s úsměvem</span>
        </a>

        <div class="ms-auto flex items-center gap-2 text-sm">
          <span class="hidden md:inline">marek.macura&#64;rksting.cz</span>
          <span hlmBadge variant="secondary">{{ cart.kredity() | number: '1.0-0' }} kreditů</span>

          <!-- Mini-košík -->
          <hlm-sheet side="right">
            <button hlmSheetTrigger hlmBtn variant="secondary" size="sm" class="relative">
              <ng-icon name="lucideShoppingCart" />
              Košík
              @if (cart.pocetKusu() > 0) {
                <span
                  class="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-xs font-bold text-background"
                >
                  {{ cart.pocetKusu() }}
                </span>
              }
            </button>
            <hlm-sheet-content *hlmSheetPortal class="flex w-full flex-col sm:max-w-md">
              <hlm-sheet-header>
                <h3 hlmSheetTitle>Košík ({{ cart.pocetKusu() }})</h3>
              </hlm-sheet-header>

              @if (cart.polozky().length === 0) {
                <div class="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-muted-foreground">
                  <ng-icon name="lucideShoppingCart" class="text-4xl opacity-40" />
                  <p>Košík je zatím prázdný.</p>
                  <button hlmSheetClose hlmBtn variant="outline" size="sm">Zpět k nákupu</button>
                </div>
              } @else {
                <div class="flex-1 overflow-y-auto px-4">
                  @for (pol of cart.polozky(); track $index) {
                    <div class="flex gap-3 py-3">
                      <a [routerLink]="['/produkt', pol.produkt.id]" class="h-16 w-16 shrink-0 rounded-md border bg-white p-1">
                        <img [src]="pol.produkt.obrazky[0]" [alt]="pol.produkt.nazev" class="h-full w-full object-contain" />
                      </a>
                      <div class="min-w-0 flex-1">
                        <p class="truncate text-sm font-medium">{{ pol.produkt.nazev }}</p>
                        @if (pol.varianta) {
                          <p class="text-xs text-muted-foreground">{{ pol.varianta }}</p>
                        }
                        <div class="mt-1 flex items-center gap-1">
                          <button hlmBtn variant="outline" size="icon-xs" (click)="cart.zmenitMnozstvi(pol, pol.mnozstvi - 1)">
                            <ng-icon name="lucideMinus" />
                          </button>
                          <span class="w-8 text-center text-sm">{{ pol.mnozstvi }}</span>
                          <button hlmBtn variant="outline" size="icon-xs" (click)="cart.zmenitMnozstvi(pol, pol.mnozstvi + 1)">
                            <ng-icon name="lucidePlus" />
                          </button>
                          <button hlmBtn variant="ghost" size="icon-xs" class="ms-1 text-muted-foreground" (click)="cart.odebrat(pol)">
                            <ng-icon name="lucideTrash2" />
                          </button>
                        </div>
                      </div>
                      <span class="shrink-0 text-sm font-semibold">
                        {{ pol.mnozstvi * pol.produkt.cena | number: '1.2-2' }} Kč
                      </span>
                    </div>
                    <hlm-separator />
                  }
                </div>
                <hlm-sheet-footer class="mt-auto">
                  <div class="flex w-full items-center justify-between text-base font-bold">
                    <span>Celkem</span>
                    <span>{{ cart.celkem() | number: '1.2-2' }} Kč</span>
                  </div>
                  <button hlmSheetClose hlmBtn class="w-full" routerLink="/kosik">Přejít k objednávce</button>
                </hlm-sheet-footer>
              }
            </hlm-sheet-content>
          </hlm-sheet>
        </div>
      </div>
    </header>

    <main class="min-h-screen bg-muted/30">
      <router-outlet />
    </main>

    <footer class="border-t bg-background">
      <div class="mx-auto max-w-7xl px-4 py-6 text-sm text-muted-foreground">
        Interní e‑shop — demo postavené na Angularu a
        <a href="https://spartan.ng" class="underline underline-offset-4">spartan/ui</a>.
      </div>
    </footer>

    <hlm-toaster position="bottom-right" richColors />
  `,
})
export class App {
  protected readonly cart = inject(CartService);
}
