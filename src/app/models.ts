export type Stitek = 'novinka' | 'akce' | 'tip';

export interface Kategorie {
  id: string;
  nazev: string;
}

export interface Dokument {
  nazev: string;
  typ: 'pdf' | 'xlsx' | 'docx' | 'odkaz';
  url: string;
}

export interface Produkt {
  id: string;
  kod: string;
  nazev: string;
  popis?: string;
  kategorieId: string;
  cena: number; // Kč == kredity
  skladem: number | 'dodavatel';
  stitky: Stitek[];
  obrazky: string[];
  dokumenty: Dokument[];
  /** volitelné varianty (velikost apod.) */
  varianty?: { nazev: string; hodnoty: string[] };
  lzePlatitKreditem: boolean;
}

export interface PolozkaKosiku {
  produkt: Produkt;
  mnozstvi: number;
  varianta?: string;
  poznamka?: string;
}

export type Doprava = 'osobni' | 'zasilkovna';

export interface Objednavka {
  polozky: PolozkaKosiku[];
  doprava: Doprava;
  pobocka: string;
  kredity: number;
  poznamka: string;
}
