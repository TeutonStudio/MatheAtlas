// ./src/Daten/Formeln/LaTeX.ts

export function _variable(bezeichner:string) {
  return "\\text{"+bezeichner+"}"
}

export function _indizies(objekt:string,oben:string,unten:string) {
  return objekt+"_{"+unten+"}^{"+oben+"}";
}

export function _klammern(inhalt:string) {
  return "\\left("+inhalt+"\\right)";
}

export function _operator(operator:string,oben:string,unten:string) {
  return _indizies(operator+"\\limits",oben,unten);
}

export function _substack(oben:string,unten:string) {
  return "\\substack{"+oben+"\\\\"+unten+"}";
}

export function _liste(
  einträge:string[],
  separierer:string,
  prefix = " ",
  postfix = " ",
) { return einträge.map((str:string) => [prefix,str,postfix].join(" ")).join(separierer) }

function _Tupel(einträge:string[],separierer:string) {
  return "\\begin{pmatrix}" + _liste(einträge,separierer) + "\\end{pmatrix}";
}

export function _zeilenTupel(einträge: string[]) {
  return _Tupel(einträge,"&");
}

export function _spaltenTupel(einträge:string[]) {
  return _Tupel(einträge,"\\\\");
}
