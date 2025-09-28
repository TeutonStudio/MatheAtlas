// ./src/Daten/Formeln/rechnen.ts

import { _liste, _operator } from "@/Daten/Formeln/LaTeX.ts"
import { element } from "@/Daten/Formeln/logik.ts"

export function komplex(reel:string,imaginär:string) {
  return addition([reel,imaginär+"\\cdot\\mathrm{i}"])
}

export function addition(einträge:string[]) {
  return _liste(einträge,"+")
};
export function summe(
  variable = "x",
  indexmenge = "m",
) {
  return _operator("\\sum","",element(variable,indexmenge))+""
};

export function subtraktion(minuend:string,subtrahend:string) {
  return minuend + " - " + subtrahend
};

export function multiplikation(einträge:string[]) {
  return _liste(einträge,"\\cdot")
};

export function division(dividend:string,divisor:string) {
  return "\\frac{"+dividend+"}{"+divisor+"}"
};