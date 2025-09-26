/// ./src/Daten/Formeln/mengen.ts

import { _liste } from "@/Daten/Formeln/LaTeX.ts"


export function LeereMenge() { return "\\emptyset" };

export function Mengen(buchstabe:string) { return "\\mathbb{"+buchstabe+"}" }

export function vereinigung(einträge:string[]) {
  return _liste(einträge,"\\cup");
};

export function schnitt(einträge:string[]) {
  return _liste(einträge,"\\cap");
};

export function differenz(eintrag:[string,string]) {
  return eintrag[0]+"\\setminus "+eintrag[1];
};

// export function symmetrischeDifferenz(einträge:string[]) {
//   return _liste(einträge,"\\oplus");
// };