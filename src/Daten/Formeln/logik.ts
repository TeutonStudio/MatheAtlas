// ./src/Daten/Formeln/logik.ts

import { _liste } from "@/Daten/Formeln/LaTeX.ts"

export function lüge() { return "\\color{red}\\mathcal{L\\ddot{u}ge}" }
export function wahr() { return "\\color{green}\\mathcal{Wahr}" }
export function unentscheidbar() { return "\\color{yellow}\\mathcal{Unentscheidbar}" }

export function element(objekt:string,menge:string) {
  return objekt+" \\in "+menge;
}

export function negation(wert:string) {
  return "\\neg "+wert;
}

export function konjunktion(einträge:string[]) {
  return _liste(einträge,"\\land");
};

export function disjunktion(einträge:string[]) {
  return _liste(einträge,"\\lor");
};

export function subjunktion(bedingung:string,folgerung:string) {
  return bedingung+"\\Rightarrow "+folgerung;
}