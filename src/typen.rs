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
    /*Vektor { grundraum: SetId, dimension: u32 },
    Matrix { grundraum: SetId, breite: u32, höhe: u32 },
    Tensor { grundraum: SetId, stufe: u32, dimensionen: Vec<u32> },*/
    Abbild { wertevorrat: SetId, zielmenge: SetId },
}

impl fmt::Display for PinType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            PinType::Element => write!(f, "Element"),
            PinType::Menge => write!(f, "Menge"),
            PinType::Logik => write!(f, "Logik"),
            PinType::Zahl { raum } => write!(f, "Zahl({})", raum.latex()),
            /*PinType::Vektor { grundraum, dimension } =>
                write!(f, "Vektor({}^{} )", grundraum.latex(), dimension),
            PinType::Matrix { grundraum, breite, höhe } =>
                write!(f, "Matrix({}^{}x{})", grundraum.latex(), höhe, breite),
            PinType::Tensor { grundraum, stufe, dimensionen } =>
                write!(f, "Tensor({}, stufe {}, dim {:?})", grundraum.latex(), stufe, dimensionen),*/
            PinType::Abbild { wertevorrat, zielmenge } =>
                write!(f, "Abbild({} -> {})", wertevorrat.latex(), zielmenge.latex()),
        }
    }
}


/// Das, was entlang eines Wires “transportiert” wird.
/// Vorläufig nur LaTeX + Typ + optional SetId (für Menge-Knoten).
#[derive(Clone, Debug)]
pub struct OutputInfo {
    pub latex: String,
    pub ty: PinType,

    /// Falls die Ausgabe eine definierte Menge ist (ℕ, ℤ, … oder Custom),
    /// kannst du hier die Identität speichern. Das macht Superset/Abbild-Regeln möglich.
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
    // 1) Input Element: alles darf rein
    if matches!(input, PinType::Element) {
        return true;
    }

    // 2) Output ist ein Abbild: darf auch an Wert-Inputs, wenn Zielmenge passt
    if let PinType::Abbild { zielmenge, .. } = output {
        // "Elementtyp der Zielmenge stimmt mit Eingangstyp überein"
        // (bei Zahl mit Raum: Zielmenge muss Obermenge des erwarteten Raums sein)
        let abbild_passt_auf_wert_input = match input {
            PinType::Logik => *zielmenge == SetId::Logik,
            PinType::Zahl { raum } => is_superset(zielmenge, raum),
            PinType::Element => true, // redundant wegen early return, aber korrekt
            // solange du keine Semantik "Menge von Vektoren" usw hast: lieber nein als falsch-ja
            _ => false,
        };

        if abbild_passt_auf_wert_input {
            return true;
        }
    }

    // 3) Gleichartige Typen (mit Parametern exakt)
    match (output, input) {
        (PinType::Logik, PinType::Logik) => true,
        (PinType::Menge, PinType::Menge) => true,

        (PinType::Zahl { raum: ro }, PinType::Zahl { raum: ri }) => {
            // Output-Zahl aus ro darf in ri, wenn ri ⊇ ro (Input akzeptiert Obermenge)
            is_superset(ri, ro)
        }

        /*(PinType::Vektor { grundraum: go, dimension: do_ },
         PinType::Vektor { grundraum: gi, dimension: di_ }) => {
            do_ == di_ && is_superset(gi, go)
        }

        (PinType::Matrix { grundraum: go, breite: bo, höhe: ho },
         PinType::Matrix { grundraum: gi, breite: bi, höhe: hi }) => {
            bo == bi && ho == hi && is_superset(gi, go)
        }

        (PinType::Tensor { grundraum: go, stufe: so, dimensionen: dio },
         PinType::Tensor { grundraum: gi, stufe: si, dimensionen: dii }) => {
            so == si && dio == dii && is_superset(gi, go)
        }*/

        // 4) Abbild -> Abbild mit Superset-Regel (Input erwartet "gröber", Output darf spezieller sein)
        (
            PinType::Abbild { wertevorrat: w_out, zielmenge: z_out },
            PinType::Abbild { wertevorrat: w_in, zielmenge: z_in }
        ) => {
            is_superset(w_in, w_out) && is_superset(z_in, z_out)
        }

        _ => false,
    }
}


/// Kleine Helper, falls du SetId als LaTeX direkt willst (ohne $...$ drumrum).
pub fn latex_set(set: &SetId) -> String {
    set.latex()
}
