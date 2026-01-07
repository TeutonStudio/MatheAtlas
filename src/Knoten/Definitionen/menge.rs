// Pfad: ../src/Definitionen/menge.rs

use std::any::Any;
use std::rc::Rc;

use eframe::egui::{ComboBox, Ui};
use egui_snarl::{InPin, OutPin};
use symbolica::solve;

use crate::LaTeX::interpreter::LaTeXQuellBereitsteller;
use crate::LaTeX::menge;

use crate::basis_knoten::{Knoten, KnotenDaten, KnotenInhalt, KnotenStruktur};
use crate::latex_knoten::LatexNode;
use crate::typen::{OutputInfo, PinType, SetId};

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum DefAuswahl {
    Leer,
    Logik,
    Einzel,
    Nat,
    Ganz,
    Rat,
    Real,
    Komplex,
}

impl DefAuswahl {
    pub fn to_set_id(self) -> SetId {
        match self {
            DefAuswahl::Leer => SetId::Leer,
            DefAuswahl::Nat => SetId::Nat,
            DefAuswahl::Ganz => SetId::Ganz,
            DefAuswahl::Rat => SetId::Rat,
            DefAuswahl::Real => SetId::Real,
            DefAuswahl::Komplex => SetId::Komplex,
            DefAuswahl::Logik => SetId::Logik,
            DefAuswahl::Einzel => SetId::Any,
        }
    }

    pub fn latex(self) -> String {
        self.to_set_id().latex()
    }

    pub fn label(self) -> &'static str {
        match self {
            DefAuswahl::Einzel => "Einzelmenge",
            DefAuswahl::Leer => "Leere Menge",
            DefAuswahl::Logik => "Logik zustand",
            DefAuswahl::Nat => "Natürliche Zahlen",
            DefAuswahl::Ganz => "Ganze Zahlen",
            DefAuswahl::Rat => "Rationale Zahlen",
            DefAuswahl::Real => "Reelle Zahlen",
            DefAuswahl::Komplex => "Komplexe Zahlen",
        }
    }
}

/// 0 Inputs (meistens), 1 Output (Menge), Dropdown
pub struct DefiniereMengeNode {
    selected: DefAuswahl,
    input_cache: Option<PinType>,
    latex: LatexNode,
    dirty: bool,
}

impl DefiniereMengeNode {
    pub fn new() -> Self {
        Self::new_with_selected(DefAuswahl::Leer)
    }

    pub fn new_with_selected(selected: DefAuswahl) -> Self {
        let provider: Rc<dyn LaTeXQuellBereitsteller> = Rc::new(DefineSetProvider::new(selected));
        Self {
            selected,
            input_cache: None,
            latex: LatexNode::new("Definiere Menge", provider),
            dirty: true,
        }
    }

    fn set_provider_from_selected(&mut self) {
        let provider: Rc<dyn LaTeXQuellBereitsteller> =
            Rc::new(DefineSetProvider::new(self.selected));
        self.latex.provider = provider;
    }

    pub fn ändere_auswahl(&mut self, neue_auswahl: DefAuswahl) {
        if self.selected != neue_auswahl {
            self.selected = neue_auswahl;
            self.dirty = true;
            self.set_provider_from_selected();
        }
    }
}

impl KnotenInhalt for DefiniereMengeNode {
    fn show_input(&mut self, _: &InPin, _: &mut Ui) {
        unreachable!()
    }

    fn show_output(&mut self, pin: &OutPin, ui: &mut Ui) {
        // Wir “füttern” den LatexProvider mit dem aktuellen OutputInfo als “Input-Kontext”
        // (so wie du es bisher gemacht hast).
        self.latex
            .on_inputs_changed(vec![Some(self.output_info(0))]);

        self.latex.show_output(pin, ui);
    }

    fn show_body(
        &mut self,
        node: egui_snarl::NodeId,
        _inputs: &[InPin],
        _outputs: &[OutPin],
        ui: &mut Ui,
    ) -> bool {
        let mut changed = false;

        ComboBox::from_id_salt(("define_set", node))
            .selected_text(self.selected.label())
            .show_ui(ui, |ui| {
                for v in [
                    DefAuswahl::Leer,
                    DefAuswahl::Logik,
                    DefAuswahl::Einzel,
                    DefAuswahl::Nat,
                    DefAuswahl::Ganz,
                    DefAuswahl::Rat,
                    DefAuswahl::Real,
                    DefAuswahl::Komplex,
                ] {
                    if ui.selectable_value(&mut self.selected, v, v.label()).changed() {
                        changed = true;
                    }
                }
            });

        if changed {
            self.dirty = true;
            self.set_provider_from_selected();
        }

        false
    }

    fn show_header(
        &mut self,
        node: egui_snarl::NodeId,
        inputs: &[InPin],
        outputs: &[OutPin],
        ui: &mut Ui,
    ) -> bool {
        self.latex.show_header(node, inputs, outputs, ui)
    }

    fn show_footer(
        &mut self,
        _node: egui_snarl::NodeId,
        _inputs: &[InPin],
        _outputs: &[OutPin],
        _ui: &mut Ui,
    ) -> bool {
        false
    }
}

impl KnotenDaten for DefiniereMengeNode {
    fn on_inputs_changed(&mut self, inputs: Vec<Option<OutputInfo>>) {
        if self.selected != DefAuswahl::Einzel {
            // Wenn du nicht Einzel bist, brauchst du den Cache nicht.
            if self.input_cache.take().is_some() {
                self.dirty = true;
            }
            return;
        }

        // Input 0 lesen (falls vorhanden)
        let new_cache: Option<PinType> = inputs
            .get(0)
            .and_then(|opt| opt.as_ref())
            .map(|info| info.ty.clone());

        // Nur dirty, wenn wirklich geändert
        if self.input_cache != new_cache {
            self.input_cache = new_cache;
            self.dirty = true;

            // Optional: Provider neu setzen, falls er auf selected basiert (tut er)
            // Für Einzel brauchst du evtl. nix, aber wenn dein Provider Out-Label davon abhängig macht,
            // dann ist das ok.
            self.set_provider_from_selected();
        }
    }

    fn output_info(&self, _o: usize) -> OutputInfo {
        OutputInfo {
            latex: self.selected.latex(),
            ty: PinType::Menge {
                elem: Box::new(erhalte_type(&self.selected, &self.input_cache)),
                set: None,
            },
            value: None,
            set: None,
            set_id: Some(self.selected.to_set_id()),
        }
    }

    fn take_dirty(&mut self) -> bool {
        std::mem::take(&mut self.dirty)
    }
}

impl KnotenStruktur for DefiniereMengeNode {
    fn name(&self) -> &str {
        "Definiere Menge"
    }

    fn inputs(&self) -> usize {
        self.latex.provider.in_pins()
    }

    fn outputs(&self) -> usize {
        self.latex.provider.out_pins()
    }

    fn input_type(&self, _i: usize) -> PinType {
        PinType::Element // TODO Falls verbunden, output_type des verbundenen Output-Pin
    }

    fn output_type(&self, _o: usize) -> PinType {
        // Typ-Logik bleibt lokal, statt über den Trait-Object-Provider zu gehen
        erhalte_type(&self.selected,&self.input_cache)
    }
}

impl Knoten for DefiniereMengeNode {
    fn as_any(&mut self) -> &mut dyn Any {
        self
    }
}

struct DefineSetProvider {
    selected: DefAuswahl,
}

impl DefineSetProvider {
    pub fn new(selected: DefAuswahl) -> Self {
        Self { selected }
    }
}

impl LaTeXQuellBereitsteller for DefineSetProvider {
    fn title(&self, _inputs: &[&OutputInfo]) -> Option<String> {
        Some(r"\textbf{ZFC Menge}".into())
    }

    fn body(&self, _: &[&OutputInfo]) -> Option<String> {
        None
    }

    fn footer(&self, _: &[&OutputInfo]) -> Option<String> {
        Some(String::new())
    }

    fn in_pin_label(&self, _: usize, _: &[&OutputInfo]) -> Option<String> {
        None
    }

    fn out_pin_label(&self, _: usize, inputs: &[&OutputInfo]) -> Option<String> {
        match self.selected {
            DefAuswahl::Einzel => Some(menge::leer()), // TODO: wenn verbunden, menge_von(inputs[0].latex)
            _ => Some(erhalte_mengenlatex(inputs)),
        }
    }

    fn in_pins(&self) -> usize {
        match self.selected {
            DefAuswahl::Einzel => 1,
            _ => 0,
        }
    }

    fn out_pins(&self) -> usize {
        1
    }
}

fn erhalte_mengenlatex(inputs: &[&OutputInfo]) -> String {
    inputs
        .get(0)
        .map(|i| i.latex.clone())
        .unwrap_or_else(|| menge::leer())
}

pub fn erhalte_type(selected: &DefAuswahl, input_cache: &Option<PinType>) -> PinType {
    let type_: PinType = match selected {
        DefAuswahl::Einzel => input_cache.clone().unwrap_or(PinType::Element),
        DefAuswahl::Logik => PinType::Logik,
        DefAuswahl::Nat => PinType::Zahl { raum: SetId::Nat },
        DefAuswahl::Ganz => PinType::Zahl { raum: SetId::Ganz },
        DefAuswahl::Rat => PinType::Zahl { raum: SetId::Rat },
        DefAuswahl::Real => PinType::Zahl { raum: SetId::Real },
        DefAuswahl::Komplex => PinType::Zahl {
            raum: SetId::Komplex,
        },
        _ => PinType::Element,
    };

    PinType::Menge {
        elem: Box::new(type_),
        set: None,
    }
}