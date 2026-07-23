# Interní e‑shop — demo na Angular + spartan/ui

Živá ukázka modernizace interního e‑shopu, postavená byznys zadáním a určená jako
startovní bod pro vývojový tým. Obsahuje katalog s kategoriemi a štítky, detail
produktu s galerií (zoom, obrázky se nedeformují), dokumenty u produktu,
potvrzovací dialog „Do košíku" s poznámkou/customizací, košík a 4krokovou
objednávku placenou kredity (1 kredit = 1 Kč). Vše responzivní (mobil i desktop).

## Spuštění

```bash
npm install
npx ng serve        # dev server na http://localhost:4200
npx ng build        # produkční build do dist/
```

Vyžaduje Node 22+.

## Jak je to postavené — spartan/ui ve zkratce

[Spartan](https://spartan.ng) má dvě vrstvy:

1. **Brain (`@spartan-ng/brain`)** — npm balíček s neostylovanou logikou
   (přístupnost, klávesnice, focus management). Aktualizuje se přes `npm update`.
2. **Helm (`hlm*`)** — ostylované komponenty, které se **kopírují do projektu**
   (složka `src/app/ui/`). Kód vlastníme my: úprava vzhledu = úprava Tailwind
   tříd přímo u nás, žádné čekání na knihovnu ani verzní konflikty.

Komponenty se přidávají generátorem:

```bash
npx ng g @spartan-ng/cli:ui <nazev>     # např. dialog, table, select…
```

Konfigurace generátoru je v `components.json`, aliasy `@spartan-ng/helm/*`
v `tsconfig.json`.

## Firemní vzhled

Celé přebarvení do firemní žluté je **jen pár CSS proměnných** na konci
`src/styles.css` (`--primary`, `--primary-foreground`, `--ring`). Stejným
způsobem lze doladit radius, fonty atd. — komponenty se přizpůsobí samy.

## Struktura

```
src/app/
├── ui/                  # zkopírované Spartan helm komponenty (vlastníme je)
├── pages/
│   ├── katalog.ts       # katalog: kategorie, hledání, štítky, karty produktů
│   ├── produkt-detail.ts# detail: galerie se zoomem, dokumenty, breadcrumb
│   └── kosik.ts         # košík + kroky Doprava → Platba (kredity) → Shrnutí
├── shared/
│   └── pridat-do-kosiku.ts  # dialog „Do košíku" s variantou a poznámkou
├── cart.service.ts      # stav košíku a kreditů (Angular signals)
├── data.ts              # MOCK data — zde se napojí stávající backend
└── models.ts            # typy (Produkt, Kategorie, PolozkaKosiku…)
```

## Napojení na stávající backend

Demo běží na mock datech v `data.ts`. Pro napojení:

1. `data.ts` nahradit službou, která volá stávající API
   (produkty, kategorie, dokumenty — struktura `Produkt` v `models.ts`
   odpovídá tomu, co dnes e‑shop zobrazuje: kód, cena, sklad, štítky, obrázky).
2. `CartService.kredity` plnit ze stávajícího účtu uživatele.
3. `Kosik.odeslat()` odeslat na stávající endpoint objednávky
   (struktura `Objednavka` v `models.ts` — položky vč. poznámek, doprava,
   pobočka, uplatněné kredity, poznámka).

## Workflow byznys ↔ vývoj

1. Byznys uživatel popíše/mockne mini‑aplikaci (jako vznikl tento projekt).
2. Vývojář převezme zdrojáky — komponenty jsou standardní Spartan/Tailwind,
   takže se rovnou upravují, nic se nepřepisuje.
3. Nové obrazovky = skládání stejných `hlm*` komponent, případně
   `npx ng g @spartan-ng/cli:ui <nazev>` pro další primitiva.
