import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmRadioGroupImports } from '@spartan-ng/helm/radio-group';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { CartService } from '../cart.service';
import { Doprava } from '../models';

const POBOCKY = ['Třinec', 'Ostrava', 'Frýdek-Místek', 'Havířov', 'Brno', 'Praha'];

@Component({
  selector: 'app-kosik',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    FormsModule,
    RouterLink,
    HlmAlertImports,
    HlmButtonImports,
    HlmCardImports,
    HlmFieldImports,
    HlmInputImports,
    HlmLabelImports,
    HlmRadioGroupImports,
    HlmSelectImports,
    HlmSeparatorImports,
    HlmTableImports,
    HlmTabsImports,
    HlmTextareaImports,
  ],
  template: `
    <div class="mx-auto w-full max-w-4xl px-4 py-6">
      @if (odeslano()) {
        <div hlmAlert class="border-green-600/40 bg-green-50">
          <h4 hlmAlertTitle>✅ Objednávka byla odeslána</h4>
          <p hlmAlertDescription>
            Děkujeme! Objednávka bude vyřízena a najdete ji v sekci „Moje objednávky".
          </p>
        </div>
        <a hlmBtn routerLink="/" class="mt-6">Zpět na katalog</a>
      } @else if (cart.polozky().length === 0) {
        <div class="py-16 text-center">
          <p class="mb-4 text-muted-foreground">Košík je prázdný.</p>
          <a hlmBtn routerLink="/">Zpět na katalog</a>
        </div>
      } @else {
        <hlm-tabs [tab]="krok()" (tabActivated)="krok.set($event)" class="w-full">
          <hlm-tabs-list class="grid w-full grid-cols-4" aria-label="Kroky objednávky">
            <button hlmTabsTrigger="kosik">1. Košík</button>
            <button hlmTabsTrigger="doprava">2. Doprava</button>
            <button hlmTabsTrigger="platba">3. Platba</button>
            <button hlmTabsTrigger="shrnuti">4. Shrnutí</button>
          </hlm-tabs-list>

          <!-- 1. KOŠÍK -->
          <div hlmTabsContent="kosik" class="pt-4">
            <div hlmTableContainer>
              <table hlmTable>
                <thead hlmTableHeader>
                  <tr hlmTableRow>
                    <th hlmTableHead>Název</th>
                    <th hlmTableHead class="w-24 text-right">Počet ks</th>
                    <th hlmTableHead class="w-28 text-right">Cena/J</th>
                    <th hlmTableHead class="w-28 text-right">Celkem</th>
                    <th hlmTableHead class="w-20"></th>
                  </tr>
                </thead>
                <tbody hlmTableBody>
                  @for (pol of cart.polozky(); track $index) {
                    <tr hlmTableRow>
                      <td hlmTableCell class="whitespace-normal">
                        <a [routerLink]="['/produkt', pol.produkt.id]" class="font-medium hover:underline">
                          {{ pol.produkt.nazev }}
                        </a>
                        @if (pol.varianta) {
                          <span class="block text-xs text-muted-foreground">{{ pol.varianta }}</span>
                        }
                        @if (pol.poznamka) {
                          <span class="block text-xs text-muted-foreground italic">„{{ pol.poznamka }}"</span>
                        }
                      </td>
                      <td hlmTableCell class="text-right">
                        <input
                          hlmInput
                          type="number"
                          min="0"
                          class="w-20 text-right"
                          [ngModel]="pol.mnozstvi"
                          (ngModelChange)="cart.zmenitMnozstvi(pol, $event)"
                        />
                      </td>
                      <td hlmTableCell class="text-right">{{ pol.produkt.cena | number: '1.2-2' }} Kč</td>
                      <td hlmTableCell class="text-right font-medium">
                        {{ pol.mnozstvi * pol.produkt.cena | number: '1.2-2' }} Kč
                      </td>
                      <td hlmTableCell class="text-right">
                        <button hlmBtn variant="ghost" size="sm" (click)="cart.odebrat(pol)">✕</button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            <div class="mt-4 flex items-center justify-between">
              <span class="text-lg font-bold">Celkově: {{ cart.celkem() | number: '1.2-2' }} Kč</span>
              <button hlmBtn (click)="krok.set('doprava')">Pokračovat k dopravě</button>
            </div>
          </div>

          <!-- 2. DOPRAVA -->
          <div hlmTabsContent="doprava" class="pt-4">
            <div hlmCard>
              <div hlmCardHeader>
                <h3 hlmCardTitle>Doprava</h3>
              </div>
              <div hlmCardContent class="flex flex-col gap-4">
                <hlm-radio-group [(ngModel)]="doprava">
                  <div class="flex items-center gap-3">
                    <hlm-radio value="osobni" inputId="d1">
                      <hlm-radio-indicator indicator />
                    </hlm-radio>
                    <label hlmLabel for="d1">Osobní odběr na pobočce</label>
                  </div>
                  <div class="flex items-center gap-3">
                    <hlm-radio value="zasilkovna" inputId="d2">
                      <hlm-radio-indicator indicator />
                    </hlm-radio>
                    <label hlmLabel for="d2">Doručit Zásilkovnou</label>
                  </div>
                </hlm-radio-group>

                @if (doprava === 'osobni') {
                  <hlm-field class="max-w-xs">
                    <label hlmFieldLabel>Pobočka</label>
                    <hlm-select [(ngModel)]="pobocka" [itemToString]="jakoText">
                      <hlm-select-trigger class="w-full">
                        <hlm-select-value placeholder="Vyberte pobočku" />
                      </hlm-select-trigger>
                      <hlm-select-content *hlmSelectPortal>
                        @for (p of pobocky; track p) {
                          <hlm-select-item [value]="p">{{ p }}</hlm-select-item>
                        }
                      </hlm-select-content>
                    </hlm-select>
                  </hlm-field>
                }
              </div>
            </div>
            <div class="mt-4 flex justify-between">
              <button hlmBtn variant="outline" (click)="krok.set('kosik')">Zpět</button>
              <button hlmBtn (click)="krok.set('platba')">Pokračovat k platbě</button>
            </div>
          </div>

          <!-- 3. PLATBA -->
          <div hlmTabsContent="platba" class="pt-4">
            <div hlmCard>
              <div hlmCardHeader>
                <h3 hlmCardTitle>Platba kredity</h3>
                <p hlmCardDescription>Váš zůstatek: {{ cart.kredity() | number: '1.0-0' }} kreditů (1 kredit = 1 Kč)</p>
              </div>
              <div hlmCardContent class="flex flex-col gap-4">
                <hlm-field class="max-w-xs">
                  <label hlmFieldLabel for="kredity">Uplatnit kredity</label>
                  <input
                    hlmInput
                    id="kredity"
                    type="number"
                    min="0"
                    [max]="maxKredity()"
                    [ngModel]="kredity()"
                    (ngModelChange)="kredity.set($event ?? 0)"
                  />
                  <p hlmFieldDescription>Maximálně {{ maxKredity() | number: '1.0-0' }}.</p>
                </hlm-field>
                <hlm-separator />
                <dl class="flex max-w-xs flex-col gap-1 text-sm">
                  <div class="flex justify-between">
                    <dt>Celkem</dt>
                    <dd>{{ cart.celkem() | number: '1.2-2' }} Kč</dd>
                  </div>
                  <div class="flex justify-between">
                    <dt>Kreditem</dt>
                    <dd>−{{ pouzeKredity() | number: '1.2-2' }} Kč</dd>
                  </div>
                  <div class="flex justify-between font-bold">
                    <dt>Zbývá uhradit</dt>
                    <dd>{{ zbyvaUhradit() | number: '1.2-2' }} Kč</dd>
                  </div>
                </dl>
              </div>
            </div>
            <div class="mt-4 flex justify-between">
              <button hlmBtn variant="outline" (click)="krok.set('doprava')">Zpět</button>
              <button hlmBtn (click)="krok.set('shrnuti')">Pokračovat ke shrnutí</button>
            </div>
          </div>

          <!-- 4. SHRNUTÍ -->
          <div hlmTabsContent="shrnuti" class="flex flex-col gap-4 pt-4">
            <div hlmCard>
              <div hlmCardHeader>
                <h3 hlmCardTitle>Shrnutí objednávky</h3>
              </div>
              <div hlmCardContent class="flex flex-col gap-3 text-sm">
                <p>
                  <strong>Doprava:</strong>
                  {{ doprava === 'osobni' ? 'Osobní odběr — ' + (pobocka || 'nevybráno') : 'Zásilkovna' }}
                </p>
                <p>
                  <strong>Platba:</strong> kreditem {{ pouzeKredity() | number: '1.2-2' }} Kč, zbývá uhradit
                  {{ zbyvaUhradit() | number: '1.2-2' }} Kč
                </p>
                <hlm-separator />
                @for (pol of cart.polozky(); track $index) {
                  <div class="flex justify-between gap-4">
                    <span>
                      {{ pol.mnozstvi }}× {{ pol.produkt.nazev }}
                      @if (pol.varianta) {
                        ({{ pol.varianta }})
                      }
                      @if (pol.poznamka) {
                        <span class="block text-xs text-muted-foreground italic">„{{ pol.poznamka }}"</span>
                      }
                    </span>
                    <span class="shrink-0 font-medium">
                      {{ pol.mnozstvi * pol.produkt.cena | number: '1.2-2' }} Kč
                    </span>
                  </div>
                }
                <hlm-separator />
                <p class="text-right text-lg font-bold">Celkem: {{ cart.celkem() | number: '1.2-2' }} Kč</p>
              </div>
            </div>

            <hlm-field>
              <label hlmFieldLabel for="poznamka">Poznámka k objednávce</label>
              <textarea hlmTextarea id="poznamka" rows="3" [(ngModel)]="poznamka"></textarea>
            </hlm-field>

            <div class="flex justify-between">
              <button hlmBtn variant="outline" (click)="krok.set('platba')">Zpět</button>
              <button hlmBtn size="lg" (click)="odeslat()">✓ Potvrdit a odeslat objednávku</button>
            </div>
          </div>
        </hlm-tabs>
      }
    </div>
  `,
})
export class Kosik {
  protected readonly cart = inject(CartService);
  protected readonly pobocky = POBOCKY;

  protected readonly krok = signal('kosik');
  protected doprava: Doprava = 'osobni';
  protected pobocka = 'Třinec';
  protected readonly kredity = signal(0);
  protected poznamka = '';
  protected readonly odeslano = signal(false);

  protected readonly maxKredity = computed(() =>
    Math.min(this.cart.kredity(), Math.floor(this.cart.celkem())),
  );
  protected readonly pouzeKredity = computed(() =>
    Math.max(0, Math.min(this.kredity() || 0, this.maxKredity())),
  );
  protected readonly zbyvaUhradit = computed(() => this.cart.celkem() - this.pouzeKredity());

  protected readonly jakoText = (v: string) => v ?? '';

  protected odeslat() {
    // Zde by se objednávka poslala na backend (stávající API e-shopu).
    this.cart.kredity.update((k) => k - this.pouzeKredity());
    this.cart.vyprazdnit();
    this.odeslano.set(true);
  }
}
