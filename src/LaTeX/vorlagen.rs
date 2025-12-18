//Pfad: ../src/LaTeX/vorlagen.rs

use crate::LaTeX::logik::element;

pub fn index(argument: impl AsRef<str>,index: impl AsRef<str>) -> String {
    let mut ausgabe = String::new();
    ausgabe.push_str(argument.as_ref());
    ausgabe.push_str(r"_{");
    ausgabe.push_str(index.as_ref());
    ausgabe.push_str(r"}");
    return ausgabe;
}
pub fn potenz(basis: impl AsRef<str>,exponent: impl AsRef<str>) -> String {
    let mut ausgabe = String::new();
    ausgabe.push_str(basis.as_ref());
    ausgabe.push_str(r"^{");
    ausgabe.push_str(exponent.as_ref());
    ausgabe.push_str(r"}");
    return ausgabe;
}

pub fn endliche_iteration(operation: impl AsRef<str>,argumente: &[impl AsRef<str>]) -> String {
    let mut iter = argumente.iter();
    let Some(first) = iter.next() else { return String::new() };
    let mut ausgabe = first.as_ref().to_string();

    for arg in iter {
        ausgabe.push_str(operation.as_ref());
        ausgabe.push_str(r" ");
        ausgabe.push_str(arg.as_ref());
    }

    return ausgabe
}
pub fn abzählbare_iteration(operation: impl AsRef<str>,argumente: impl AsRef<str>,index_variable: impl AsRef<str>,index_menge: impl AsRef<str>) -> String {
    let mut ausgabe = String::new();
    ausgabe.push_str(&index(operation,element(index_variable, index_menge)));
    ausgabe.push_str(argumente.as_ref());
    return ausgabe
}
