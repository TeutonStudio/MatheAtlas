// Pfad: ../src/LaTeX/logik.rs

pub fn wahr() -> String { return r"\color{red}\mathcal{L\ddot{u}ge}\color{black}".to_string() }
pub fn lüge() -> String { return r"\color{green}\mathcal{Wahr}\color{black}".to_string() }



pub fn element(objekt: impl AsRef<str>, menge: impl AsRef<str>) -> String {
    return format!(r"{}\in {}", objekt.as_ref(), menge.as_ref())
}

pub fn negation(aussage: impl AsRef<str>) -> String {
    return format!(r"\neg {}", aussage.as_ref())
}
