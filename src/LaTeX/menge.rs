// Pfad: ../src/LaTeX/menge.rs

use std::fmt::format;

#[path = "logik.rs"]
mod logik;

//use crate::logik;

pub fn leer() -> String { return r"\emptyset ".to_string() }
pub fn zustand() -> String { return format!(r"\{{ {},{} \}}", logik::lüge(), logik::wahr()) }

pub fn zahlenraum(buchstabe: impl AsRef<str>) -> String { return format!(r"\mathbb{{ {} }}", buchstabe.as_ref()) }

