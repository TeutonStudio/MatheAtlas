// Pfad: ../src/typen.rs

use std::fmt;

use crate::LaTeX::{logik,menge};
use symbolica::domains::integer;

/// Identität / Symbol für Mengen.
/// Für den Anfang reichen die vordefinierten Ketten + Custom.
/// "Any" ist die grobe "Universumsmenge", falls du nichts weißt.
#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub enum SetId {
    Any,
    Leer,
    Logik,
    Nat,Ganz,Rat,Real,Komplex, // Zahl
    Custom(String),
}

impl SetId {
    pub fn latex(&self) -> String {
        match self {
            SetId::Any => r"\mathcal{U}".to_string(),
            SetId::Leer => menge::leer(),
            SetId::Logik => menge::zustand(),
            SetId::Nat => menge::zahlenraum("N"),
            SetId::Ganz => menge::zahlenraum("Z"),
            SetId::Rat => menge::zahlenraum("Q"),
            SetId::Real => menge::zahlenraum("R"),
            SetId::Komplex => menge::zahlenraum("C"),
            SetId::Custom(s) => s.clone(),
        }
    }

    pub fn elements_latex(&self) -> Option<Vec<String>> {
        match self {
            SetId::Leer => Some(vec![]),
            SetId::Logik => Some(vec![logik::wahr(), logik::lüge()]),
            _ => None, // unendlich/unklar
        }
    }

    /// Ob diese Menge "endlich" ist (für deine Dropdown-Element-UI).
    pub fn is_finite(&self) -> bool {
        matches!(self, SetId::Leer | SetId::Logik)
    }
}

/// Pin-Typen. Abbild ist parametrisiert über (Wertevorrat, Zielmenge).
#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub enum PinType {
    Element,Menge,Logik,
    Zahl { raum: SetId },
    Abbild { wertevorrat: Option<SetId>, zielmenge: Option<SetId> },
}

impl fmt::Display for PinType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            PinType::Element => write!(f, "Element"),
            PinType::Menge => write!(f, "Menge"),
            PinType::Logik => write!(f, "Logik"),
            PinType::Zahl { raum } => write!(f, "Zahl({})", raum.latex()),
            PinType::Abbild { wertevorrat, zielmenge } => {
                let w = wertevorrat.as_ref().map(|x| x.latex()).unwrap_or("?".into());
                let z = zielmenge.as_ref().map(|x| x.latex()).unwrap_or("?".into());
                write!(f, "Abbild({} -> {})", w, z)
            }
        }
    }
}


/// Das, was entlang eines Wires “transportiert” wird.
/// Vorläufig nur LaTeX + Typ + optional SetId (für Menge-Knoten).
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct OutputInfo {
    pub latex: String,
    pub ty: PinType,
    pub set_id: Option<SetId>,
}

impl OutputInfo {
    pub fn new(latex: impl Into<String>, ty: PinType) -> Self {
        Self {
            latex: latex.into(),
            ty,
            set_id: None,
        }
    }

    pub fn with_set_id(mut self, id: SetId) -> Self {
        self.set_id = Some(id);
        self
    }

    /// Wird von Nodes genutzt, die aus Input-Mengen SetId extrahieren wollen.
    pub fn try_set_id(&self) -> Option<SetId> {
        self.set_id.clone()
    }

    /// Alias (falls du in manchen Stellen `set_id()` nutzt)
    pub fn set_id(&self) -> Option<SetId> {
        self.try_set_id()
    }
}

/// Obermengenbeziehung a ⊇ b.
///
/// Das ist erstmal nur für die bekannten Zahlmengen-Kette definiert.
/// Custom-Mengen sind nur dann Obermenge, wenn exakt gleich (oder wenn a = Any).
pub fn is_superset(a: &SetId, b: &SetId) -> bool {
    if a == b {
        return true;
    }
    if matches!(a, SetId::Any) {
        return true;
    }

    // Kette: ℕ ⊆ ℤ ⊆ ℚ ⊆ ℝ ⊆ ℂ
    fn rank(s: &SetId) -> Option<u8> {
        match s {
            SetId::Nat => Some(0),
            SetId::Ganz => Some(1),
            SetId::Rat => Some(2),
            SetId::Real => Some(3),
            SetId::Komplex => Some(4),
            _ => None,
        }
    }

    match (rank(a), rank(b)) {
        (Some(ra), Some(rb)) => ra >= rb,
        _ => false, // LogikWL und Custom: ohne weitere Info kein Superset (außer Gleichheit/Any oben)
    }
}
fn opt_superset(a: &Option<SetId>, b: &Option<SetId>) -> bool {
    match (a, b) {
        (None, _) => true,                 // Input hat keine Anforderung
        (Some(_), None) => false,           // Input verlangt was, Output ist unbekannt -> blocken
        (Some(a), Some(b)) => is_superset(a, b),
    }
}


/// Enthält eine Menge (SetId) grundsätzlich Objekte eines bestimmten Typs?
/// Das ist für deine Auto-Zwischenknoten-Regeln (Wert -> Abbild, Element -> Menge) nützlich.
///
/// Wichtig: Das ist KEINE echte Mitgliedschaftsprüfung (CAS kommt später),
/// sondern nur eine grobe Typ-Zulässigkeit.
/*pub fn contains_type(set: &SetId, ty: &PinType) -> bool {
    match (set, ty) {
        (SetId::Any, _) => true,

        // Zahlmengen enthalten Zahlen (und damit auch Elemente)
        (SetId::Nat | SetId::Ganz | SetId::Rat | SetId::Real | SetId::Komplex, PinType::Zahl) => true,
        (SetId::Nat | SetId::Ganz | SetId::Rat | SetId::Real | SetId::Komplex, PinType::Element) => true,

        // Logik-Menge enthält Logik (und damit Elemente)
        (SetId::Logik, PinType::Logik) => true,
        (SetId::Logik, PinType::Element) => true,

        // Custom: ohne Semantik wissen wir's nicht -> nur Element als “kann man irgendwie interpretieren”
        (SetId::Custom(_), PinType::Element) => true,

        _ => false,
    }
}*/

/// Kompatibilität: darf ein Output-Typ an einen Input-Typ?
///
/// Regeln nach deiner Spezifikation:
/// - Input Element: alles erlaubt
/// - Input Logik: nur Logik
/// - Input Zahl: nur Zahl
/// - Input Menge: nur Menge
/// - Input Abbild(W_in, Z_in): nur Abbild(W_out, Z_out) mit
///     W_in ⊇ W_out und Z_in ⊇ Z_out
///
/// Auto-Coercions (Element->SingletonMenge, Wert->StatischeAbbildung) passieren *außerhalb* hiervon.
pub fn compatible(output: &PinType, input: &PinType) -> bool {
    if matches!(input, PinType::Element) {
        return true;
    }

    // Output ist Abbild: darf an Wert-Inputs, wenn Zielmenge bekannt und passend
    if let PinType::Abbild { zielmenge, .. } = output {
        let ok = match input {
            PinType::Logik => matches!(zielmenge, Some(z) if *z == SetId::Logik),
            PinType::Zahl { raum } => matches!(zielmenge, Some(z) if is_superset(z, raum)),
            PinType::Element => true,
            _ => false,
        };

        if ok {
            return true;
        }
    }

    match (output, input) {
        (PinType::Logik, PinType::Logik) => true,
        (PinType::Menge, PinType::Menge) => true,

        (PinType::Zahl { raum: ro }, PinType::Zahl { raum: ri }) => is_superset(ri, ro),

        (
            PinType::Abbild { wertevorrat: w_out, zielmenge: z_out },
            PinType::Abbild { wertevorrat: w_in, zielmenge: z_in },
        ) => {
            opt_superset(w_in, w_out) && opt_superset(z_in, z_out)
        }

        _ => false,
    }
}



/// Kleine Helper, falls du SetId als LaTeX direkt willst (ohne $...$ drumrum).
pub fn latex_set(set: &SetId) -> String {
    set.latex()
}
