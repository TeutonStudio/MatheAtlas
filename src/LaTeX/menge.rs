// Pfad: ../src/LaTeX/menge.rs

use crate::LaTeX::{
    vorlagen::{endliche_iteration}, 
    logik::{wahr,lüge}
};

pub fn leer() -> String { return r"\emptyset ".to_string() }
pub fn zustand() -> String { 
    let mut ausgabe = r"\{".to_string();
    ausgabe.push_str(&wahr());
    ausgabe.push_str(r",");
    ausgabe.push_str(&lüge());
    ausgabe.push_str(r"\}");
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
