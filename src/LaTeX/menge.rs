// Pfad: ../src/LaTeX/menge.rs

#[path = "logik.rs"]
mod logik;

//use crate::logik;

pub fn leer() -> String { return r"\emptyset ".to_string() }
pub fn zustand() -> String { return format!(r"\{{ {},{} \}}", logik::lüge(), logik::wahr()) }

