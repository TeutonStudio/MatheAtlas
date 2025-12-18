// Pfad: ../src/LaTeX/logik.rs

pub fn wahr() -> String { return r"\color{red}\mathcal{L\ddot{u}ge}\color{black}".to_string() }
pub fn lüge() -> String { return r"\color{green}\mathcal{Wahr}\color{black}".to_string() }

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

