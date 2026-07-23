import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { toast } from '@spartan-ng/brain/sonner';
import { CartService } from '../cart.service';
import { Produkt } from '../models';

/**
 * Tlačítko „Do košíku" s potvrzovacím dialogem.
 * Uživatel může vybrat variantu, množství a připsat poznámku (customizaci)
 * — teprve potom položku potvrdí tlačítkem „Vložit do košíku".
 */
@Component({
  selector: 'app-pridat-do-kosiku',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    FormsModule,
    HlmButtonImports,
    HlmDialogImports,
    HlmFieldImports,
    HlmInputImports,
    HlmSelectImports,
    HlmTextareaImports,
  ],
  template: `
    <hlm-dialog #dlg>
      <button hlmDialogTrigger hlmBtn [size]="velikost()" class="w-full sm:w-auto">
        🛒 Do košíku
      </button>

      <hlm-dialog-content *hlmDialogPortal class="sm:max-w-md">
        <hlm-dialog-header>
          <h3 hlmDialogTitle>Vložit do košíku</h3>
          <p hlmDialogDescription>{{ produkt().nazev }}</p>
        </hlm-dialog-header>

        <hlm-field-group>
          @if (produkt().varianty; as varianty) {
            <hlm-field>
              <label hlmFieldLabel>{{ varianty.nazev }}</label>
              <hlm-select [(ngModel)]="varianta" [itemToString]="jakoText">
                <hlm-select-trigger class="w-full">
                  <hlm-select-value placeholder="Vyberte…" />
                </hlm-select-trigger>
                <hlm-select-content *hlmSelectPortal>
                  @for (hodnota of varianty.hodnoty; track hodnota) {
                    <hlm-select-item [value]="hodnota">{{ hodnota }}</hlm-select-item>
                  }
                </hlm-select-content>
              </hlm-select>
            </hlm-field>
          }

          <hlm-field>
            <label hlmFieldLabel for="mnozstvi">Počet kusů</label>
            <input hlmInput id="mnozstvi" type="number" min="1" class="w-28" [(ngModel)]="mnozstvi" />
          </hlm-field>

          <hlm-field>
            <label hlmFieldLabel for="poznamka">Poznámka / customizace</label>
            <textarea
              hlmTextarea
              id="poznamka"
              rows="3"
              placeholder="Např. rozměr plachty, číslo grafiky, jméno na vizitku…"
              [(ngModel)]="poznamka"
            ></textarea>
            <p hlmFieldDescription>Poznámka se přenese do objednávky k této položce.</p>
          </hlm-field>
        </hlm-field-group>

        @if (chybaVarianty()) {
          <p class="text-destructive text-sm">Vyberte prosím {{ produkt().varianty?.nazev?.toLowerCase() }}.</p>
        }

        <hlm-dialog-footer>
          <button hlmBtn variant="outline" hlmDialogClose>Zrušit</button>
          <button hlmBtn (click)="potvrdit(dlg)">
            Vložit do košíku · {{ (mnozstvi > 0 ? mnozstvi : 1) * produkt().cena | number: '1.2-2' }} Kč
          </button>
        </hlm-dialog-footer>
      </hlm-dialog-content>
    </hlm-dialog>
  `,
})
export class PridatDoKosiku {
  private readonly cart = inject(CartService);

  readonly produkt = input.required<Produkt>();
  readonly velikost = input<'default' | 'sm'>('default');

  protected mnozstvi = 1;
  protected varianta?: string;
  protected poznamka = '';
  protected readonly chybaVarianty = signal(false);

  protected readonly jakoText = (v: string) => v ?? '';

  protected potvrdit(dlg: { close: (result?: unknown) => void }) {
    if (this.produkt().varianty && !this.varianta) {
      this.chybaVarianty.set(true);
      return;
    }
    const ks = Math.max(1, Math.floor(this.mnozstvi || 1));
    this.cart.pridat(this.produkt(), ks, this.varianta, this.poznamka.trim() || undefined);
    toast.success('Přidáno do košíku', {
      description: `${ks}× ${this.produkt().nazev}${this.varianta ? ' (' + this.varianta + ')' : ''}`,
    });
    this.chybaVarianty.set(false);
    this.mnozstvi = 1;
    this.poznamka = '';
    this.varianta = undefined;
    dlg.close();
  }
}
