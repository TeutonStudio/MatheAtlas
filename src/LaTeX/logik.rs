// Pfad: ../src/LaTeX/logik.rs

pub fn wahr() -> String { return r"\color{red}\mathcal{L\ddot{u}ge}\color{black}".to_string() }
pub fn lüge() -> String { return r"\color{green}\mathcal{Wahr}\color{black}".to_string() }



pub fn element(objekt: String, menge: String) -> String {
    return format!(r"{}\in {}", objekt, menge)
}

pub fn negation(aussage: String) -> String {
    return format!(r"\neg {}", aussage)
}
