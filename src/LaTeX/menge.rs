// Pfad: ../src/LaTeX/menge.rs

use crate::LaTeX::{
    vorlagen::{endliche_iteration}, 
    logik::{wahr,lüge}
};

pub fn leer() -> String { return r"\emptyset ".to_string() }
pub fn menge_von(elemente: &[impl AsRef<str>]) -> String {
    let mut ausgabe = r"\{".to_string();
    let inhalt = elemente
        .iter()
        .map(|e| e.as_ref())
        .collect::<Vec<_>>()
        .join(", ");
    ausgabe.push_str(&inhalt);
    ausgabe.push_str(r"\}");
    return ausgabe
}
pub fn zustand() -> String { 
    return menge_von(&[&wahr(),&lüge()])
}

pub fn potenzmenge(menge: impl AsRef<str>) -> String {
    let mut ausgabe = String::new();
    ausgabe.push_str(r"\mathcal{P}(");
    ausgabe.push_str(menge.as_ref());
    ausgabe.push_str(")");
    return ausgabe
}

pub fn zahlenraum(buchstabe: impl AsRef<str>) -> String { return format!(r"\mathbb{{ {} }}", buchstabe.as_ref()) }

pub fn endliche_vereinigung(argumente: &[impl AsRef<str>]) -> String {
    return endliche_iteration(r"\cup ", argumente)
}

pub fn endlicher_schnitt(argumente: &[impl AsRef<str>]) -> String { 
    return endliche_iteration(r"\cap ", argumente)
}

pub fn differenz(subtrahend: impl AsRef<str>, minuend: impl AsRef<str>) -> String {
    let mut ausgabe = String::new();
    ausgabe.push_str(subtrahend.as_ref());
    ausgabe.push_str(r"\setminus ");
    ausgabe.push_str(minuend.as_ref());
    return ausgabe
}
