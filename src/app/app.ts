import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { CartService } from './cart.service';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, RouterLink, RouterOutlet, HlmButtonImports, HlmBadgeImports],
  template: `
    <header class="bg-primary text-primary-foreground">
      <div class="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <a routerLink="/" class="flex items-center gap-3">
          <span class="text-2xl font-black tracking-tight">E‑SHOP</span>
          <span class="hidden text-sm italic sm:block">Nakupujte s úsměvem</span>
        </a>

        <div class="ms-auto flex items-center gap-2 text-sm">
          <span class="hidden md:inline">marek.macura&#64;rksting.cz</span>
          <span hlmBadge variant="secondary">{{ cart.kredity() | number: '1.0-0' }} kreditů</span>
          <a hlmBtn variant="secondary" size="sm" routerLink="/kosik">
            🛒 Košík
            @if (cart.pocetKusu() > 0) {
              <span class="font-bold">({{ cart.celkem() | number: '1.2-2' }} Kč)</span>
            }
          </a>
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
  `,
})
export class App {
  protected readonly cart = inject(CartService);
}
