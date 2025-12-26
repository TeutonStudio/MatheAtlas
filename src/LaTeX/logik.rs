// Pfad: ../src/LaTeX/logik.rs

use crate::LaTeX::vorlagen::{_operator};

pub fn lüge() -> String { return r"\color{red}\mathcal{L\ddot{u}ge}\color{black}".to_string() }
pub fn wahr() -> String { return r"\color{green}\mathcal{Wahr}\color{black}".to_string() }

pub fn negation(aussage: impl AsRef<str>) -> String {
    let mut ausgabe = r"\neg ".to_string();
    ausgabe.push_str(aussage.as_ref());
    return ausgabe
}

pub fn element(objekt: impl AsRef<str>, menge: impl AsRef<str>) -> String {
    let mut ausgabe = String::new();
    ausgabe.push_str(objekt.as_ref());
    ausgabe.push_str(r"\in ");
    ausgabe.push_str(menge.as_ref());
    return ausgabe
}

pub fn konjunktion(aussage1: impl AsRef<str>, aussage2: impl AsRef<str>) -> String {
    return _operator(aussage1, aussage2, r"\land ");
}

pub fn disjunktion(aussage1: impl AsRef<str>, aussage2: impl AsRef<str>) -> String {
    return _operator(aussage1, aussage2, r"\lor ");
}

pub fn implikation(aussage1: impl AsRef<str>, aussage2: impl AsRef<str>) -> String {
    return _operator(aussage1, aussage2, r"\Rightarrow ");
}

pub fn äquivalenzrelation(aussage1: impl AsRef<str>, aussage2: impl AsRef<str>) -> String {
    return _operator(aussage1, aussage2, r"\Leftrightarrow ");
}
