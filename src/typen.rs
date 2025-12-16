// Pfad: ../src/typen.rs

use std::fmt;

/// Identität / Symbol für Mengen.
/// Für den Anfang reichen die vordefinierten Ketten + Custom.
/// "Any" ist die grobe "Universumsmenge", falls du nichts weißt.
#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub enum SetId {
    Any,
    Leer,
    Nat,       // ℕ
    Ganz,      // ℤ
    Rat,       // ℚ
    Real,      // ℝ
    Komplex,   // ℂ
    LogikWL,   // {wahr, falsch}
    Custom(String),
}

impl SetId {
    pub fn latex(&self) -> String {
        match self {
            SetId::Any => r"\mathcal{U}".to_string(),
            SetId::Leer => r"\emptyset".to_string(),
            SetId::Nat => r"\mathbb{N}".to_string(),
            SetId::Ganz => r"\mathbb{Z}".to_string(),
            SetId::Rat => r"\mathbb{Q}".to_string(),
            SetId::Real => r"\mathbb{R}".to_string(),
            SetId::Komplex => r"\mathbb{C}".to_string(),
            SetId::LogikWL => r"\{\mathrm{wahr},\mathrm{falsch}\}".to_string(),
            SetId::Custom(s) => s.clone(),
        }
    }

    /// Ob diese Menge "endlich" ist (für deine Dropdown-Element-UI).
    pub fn is_finite(&self) -> bool {
        matches!(self, SetId::LogikWL)
    }
}

/// Pin-Typen. Abbild ist parametrisiert über (Wertevorrat, Zielmenge).
#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub enum PinType {
    Element,
    Menge,
    Zahl,
    Logik,
    Abbild { wertevorrat: SetId, zielmenge: SetId },
}

impl fmt::Display for PinType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            PinType::Element => write!(f, "Element"),
            PinType::Menge => write!(f, "Menge"),
            PinType::Zahl => write!(f, "Zahl"),
            PinType::Logik => write!(f, "Logik"),
            PinType::Abbild { wertevorrat, zielmenge } => {
                write!(f, "Abbild({} -> {})", wertevorrat.latex(), zielmenge.latex())
            }
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
pub fn contains_type(set: &SetId, ty: &PinType) -> bool {
    match (set, ty) {
        (SetId::Any, _) => true,

        // Zahlmengen enthalten Zahlen (und damit auch Elemente)
        (SetId::Nat | SetId::Ganz | SetId::Rat | SetId::Real | SetId::Komplex, PinType::Zahl) => true,
        (SetId::Nat | SetId::Ganz | SetId::Rat | SetId::Real | SetId::Komplex, PinType::Element) => true,

        // Logik-Menge enthält Logik (und damit Elemente)
        (SetId::LogikWL, PinType::Logik) => true,
        (SetId::LogikWL, PinType::Element) => true,

        // Custom: ohne Semantik wissen wir's nicht -> nur Element als “kann man irgendwie interpretieren”
        (SetId::Custom(_), PinType::Element) => true,

        _ => false,
    }
}

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
    match input {
        PinType::Element => true,
        PinType::Logik => matches!(output, PinType::Logik),
        PinType::Zahl => matches!(output, PinType::Zahl),
        PinType::Menge => matches!(output, PinType::Menge),
        PinType::Abbild { wertevorrat: w_in, zielmenge: z_in } => match output {
            PinType::Abbild { wertevorrat: w_out, zielmenge: z_out } => {
                is_superset(w_in, w_out) && is_superset(z_in, z_out)
            }
            _ => false,
        },
    }
}

/// Kleine Helper, falls du SetId als LaTeX direkt willst (ohne $...$ drumrum).
pub fn latex_set(set: &SetId) -> String {
    set.latex()
}
