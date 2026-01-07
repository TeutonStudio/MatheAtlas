// Pfad: ../src/typen.rs

use std::{
    collections::HashMap,
    fmt,
    hash::{Hash, Hasher},
};

use crate::LaTeX::{logik, menge};

/// Identität / Symbol für primitive Mengen.
/// "Any" ist grob die Universumsmenge (für "weiß ich nicht").
#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub enum SetId {
    Any,
    Leer,
    Logik,
    Nat,
    Ganz,
    Rat,
    Real,
    Komplex, // Zahl
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

    pub fn is_finite(&self) -> bool {
        matches!(self, SetId::Leer | SetId::Logik)
    }
}

/* =========================================================
   Mengen-Registry (Handles + Definitions-AST)
========================================================= */

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub struct SetHandle(pub u64);

#[derive(Clone, Debug)]
pub struct Set {
    pub def: SetDef,
    pub name: Option<String>, // gespeicherte Menge (alias/label)
    pub props: SetPropsCache, // memoized Infos
}

#[derive(Clone, Debug)]
pub enum SetDef {
    Primitive(SetId),
    Explicit(Vec<OutputInfo>),
    Union(SetHandle, SetHandle),
    Intersect(SetHandle, SetHandle),
    Diff(SetHandle, SetHandle),
    Power(SetHandle),
    // Filter { base: SetHandle, pred: AbbildHandle }, // später
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum CardinalityClass {
    Finite,
    CountablyInfinite,
    Uncountable,
    Unknown,
}

#[derive(Clone, Debug)]
pub struct ElemTypeInfo {
    /// Typ, den du nach außen behauptest (kompatibel/weiterverwendbar)
    pub join: PinType,
    /// Typ-Komponenten, die in der Menge vorkommen können (für Diff/Union-Tricks)
    pub components: Vec<PinType>,
}

impl Default for ElemTypeInfo {
    fn default() -> Self {
        Self {
            join: PinType::Element,
            components: vec![PinType::Element],
        }
    }
}

#[derive(Clone, Debug, Default)]
pub struct SetPropsCache {
    pub elem_type: Option<ElemTypeInfo>,
    pub cardinality: Option<CardinalityClass>,
    pub normalized_hash: Option<u64>, // für "vielleicht gleich" / Dedupe / Cache
}

pub struct SetRegistry {
    sets: HashMap<SetHandle, Set>,
    next_id: u64,
}

impl SetRegistry {
    pub fn new() -> Self {
        Self {
            sets: HashMap::new(),
            next_id: 1,
        }
    }

    pub fn insert(&mut self, def: SetDef) -> SetHandle {
        let h = SetHandle(self.next_id);
        self.next_id += 1;
        self.sets.insert(
            h,
            Set {
                def,
                name: None,
                props: SetPropsCache::default(),
            },
        );
        h
    }

    pub fn get(&self, h: SetHandle) -> Option<&Set> {
        self.sets.get(&h)
    }

    pub fn get_mut(&mut self, h: SetHandle) -> Option<&mut Set> {
        self.sets.get_mut(&h)
    }
}

/* =========================================================
   PinType / OutputInfo
========================================================= */

#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub enum PinType {
    Element,
    Logik,

    /// Menge von Elementtyp `elem`. `set` ist optional, falls konkrete Set-Definition bekannt ist.
    Menge { elem: Box<PinType>, set: Option<SetHandle> },

    /// Zahl in einem Raum (ℕ ⊆ ℤ ⊆ ℚ ⊆ ℝ ⊆ ℂ)
    Zahl { raum: SetId },

    /// Abbildung: wertevorrat -> ziel
    Abbild {
        wertevorrat: Option<Box<PinType>>,
        zielmenge: Option<Box<PinType>>,
    },
}

impl fmt::Display for PinType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            PinType::Element => write!(f, "Element"),
            PinType::Logik => write!(f, "Logik"),
            PinType::Zahl { raum } => write!(f, "Zahl({})", raum.latex()),
            PinType::Menge { elem, set } => match set {
                Some(h) => write!(f, "Menge<{}>#{:?}", elem, h),
                None => write!(f, "Menge<{}>", elem),
            },
            PinType::Abbild { wertevorrat, zielmenge } => {
                let w = wertevorrat.as_ref().map(|x| format!("{x}")).unwrap_or("?".into());
                let z = zielmenge.as_ref().map(|x| format!("{x}")).unwrap_or("?".into());
                write!(f, "Abbild({} -> {})", w, z)
            }
        }
    }
}

/// Optional: später AST/Term für echte Elementgleichheit.
/// Im Moment absichtlich leer, damit du ohne CAS weiterkommst.
#[derive(Clone, Debug, PartialEq, Eq, Hash)]
pub enum ValueAst {
    // TODO: später Symbolica-Expression, Term-AST, etc.
    Placeholder,
}

/// Das, was entlang eines Wires transportiert wird.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct OutputInfo {
    pub latex: String,
    pub ty: PinType,

    /// optional: echte semantische Repräsentation (für extensional equality etc.)
    pub value: Option<ValueAst>,

    /// wenn Output eine konkrete Menge ist (Registry)
    pub set: Option<SetHandle>,

    /// Legacy/Übergang: primitive SetId (z.B. ℕ), falls du es noch an UI/Nodes hängen hast
    pub set_id: Option<SetId>,
}

impl OutputInfo {
    pub fn new(latex: impl Into<String>, ty: PinType) -> Self {
        Self {
            latex: latex.into(),
            ty,
            value: None,
            set: None,
            set_id: None,
        }
    }

    pub fn with_set_handle(mut self, h: SetHandle) -> Self {
        self.set = Some(h);
        self
    }

    pub fn with_set_id(mut self, id: SetId) -> Self {
        self.set_id = Some(id);
        self
    }

    pub fn try_set_id(&self) -> Option<SetId> {
        self.set_id.clone()
    }

    pub fn set_id(&self) -> Option<SetId> {
        self.try_set_id()
    }
}

/* =========================================================
   Zahlraum-Superset (ℕ ⊆ ℤ ⊆ ℚ ⊆ ℝ ⊆ ℂ)
========================================================= */

pub fn is_superset(a: &SetId, b: &SetId) -> bool {
    if a == b {
        return true;
    }
    if matches!(a, SetId::Any) {
        return true;
    }

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
        _ => false,
    }
}

/* =========================================================
   Typ-Kompatibilität inkl. "usable_as"-Regel (Abbild->Ziel)
========================================================= */

/// Deine Regel (4): Abbild nach Zahl kann als Zahl aufgefasst werden.
/// Allgemeiner: Abbild kann "als" sein Ziel verwendet werden (wenn vorhanden).
fn usable_as(ty: &PinType) -> Vec<PinType> {
    match ty {
        PinType::Abbild { zielmenge: Some(z), .. } => vec![(*z.clone()), ty.clone()],
        _ => vec![ty.clone()],
    }
}

/// "superset" im Sinne der alten Abbild-Regel:
/// input verlangt `sup`, output liefert `sub` -> ok, wenn sup ein Obertyp ist.
/// Praktisch: `sub` muss kompatibel zu `sup` sein.
fn type_superset(sup: &PinType, sub: &PinType) -> bool {
    compatible(sub, sup)
}

fn opt_type_superset(sup: &Option<Box<PinType>>, sub: &Option<Box<PinType>>) -> bool {
    match (sup, sub) {
        (None, _) => true,     // Input fordert nix
        (Some(_), None) => false, // Input fordert was, output unbekannt -> blocken
        (Some(a), Some(b)) => type_superset(a, b),
    }
}

/// Kompatibilität: darf ein Output-Typ an einen Input-Typ?
pub fn compatible(output: &PinType, input: &PinType) -> bool {
    // Alles darf an Element-Input
    if matches!(input, PinType::Element) {
        return true;
    }

    // "Abbild kann als Ziel genutzt werden"
    // (z.B. Abbild -> Logik an Logik-Input, oder Abbild -> Zahl an Zahl-Input)
    for cand in usable_as(output) {
        if matches!(cand, PinType::Abbild { .. }) {
            // kein Rekursionsloop erzwingen, Abbild behandeln wir unten separat
        } else if compatible_strict(&cand, input) {
            return true;
        }
    }

    compatible_strict(output, input)
}

fn compatible_strict(output: &PinType, input: &PinType) -> bool {
    match (output, input) {
        (PinType::Logik, PinType::Logik) => true,

        (PinType::Zahl { raum: ro }, PinType::Zahl { raum: ri }) => is_superset(ri, ro),

        (
            PinType::Menge { elem: eo, .. },
            PinType::Menge { elem: ei, .. },
        ) => {
            // Menge<Abbild->Zahl> kompatibel zu Menge<Zahl> durch usable_as auf Elementtyp
            usable_as(eo).iter().any(|cand| compatible(cand, ei))
        }

        (
            PinType::Abbild {
                wertevorrat: w_out,
                zielmenge: z_out,
            },
            PinType::Abbild {
                wertevorrat: w_in,
                zielmenge: z_in,
            },
        ) => {
            // Regel: W_in ⊇ W_out und Z_in ⊇ Z_out
            // (Input ist "breiter" als Output)
            opt_type_superset(w_in, w_out) && opt_type_superset(z_in, z_out)
        }

        _ => false,
    }
}

/* =========================================================
   Helper
========================================================= */

pub fn latex_set(set: &SetId) -> String {
    set.latex()
}
