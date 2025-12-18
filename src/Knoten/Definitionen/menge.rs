// Pfad: ../src/Definitionen/menge.rs

use std::any::Any;

use eframe::egui::{Ui,ComboBox};
use egui_snarl::{InPin, OutPin};

use crate::typen::{OutputInfo, PinType, SetId};
use crate::LaTeX::{logik,menge};


use crate::basis_knoten::Knoten;
use crate::latex_knoten::{LatexNode, LatexSourceProvider};

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum VordefMenge {
    Leer,
    Logik,
    Nat,Ganz,Rat,Real,Komplex,
}

impl VordefMenge {
    pub fn to_set_id(self) -> SetId {
        match self {
            VordefMenge::Leer => SetId::Leer,
            VordefMenge::Nat => SetId::Nat,
            VordefMenge::Ganz => SetId::Ganz,
            VordefMenge::Rat => SetId::Rat,
            VordefMenge::Real => SetId::Real,
            VordefMenge::Komplex => SetId::Komplex,
            VordefMenge::Logik => SetId::Logik,
        }
    }
        
    pub fn latex(self) -> String { return self.to_set_id().latex() }

    pub fn label(self) -> &'static str {
        match self {
            VordefMenge::Leer => "Leere Menge",
            VordefMenge::Logik => "Logik zustand",
            VordefMenge::Nat => "Natürliche Zahlen",
            VordefMenge::Ganz => "Ganze Zahlen",
            VordefMenge::Rat => "Rationale Zahlen",
            VordefMenge::Real => "Reelle Zahlen",
            VordefMenge::Komplex => "Komplexe Zahlen",
        }
    }
}

/// 0 Inputs, 1 Output (Menge), Dropdown
pub struct DefiniereMengeNode {
    selected: VordefMenge,
    latex: LatexNode,
    dirty: bool,
}

impl DefiniereMengeNode {
    pub fn new() -> Self {
        Self {
            selected: VordefMenge::Leer,
            latex: LatexNode::new("Definiere Menge", Box::new(DefineSetProvider)),
            dirty: true,
        }
    }
}

impl Knoten for DefiniereMengeNode {
    fn name(&self) -> &str { "Definiere Menge" }
    fn inputs(&self) -> usize { 0 }
    fn outputs(&self) -> usize { 1 }

    fn input_type(&self, _i: usize) -> PinType { return PinType::Element }
    fn output_type(&self, _o: usize) -> PinType { return PinType::Menge }

    fn on_inputs_changed(&mut self, _inputs: Vec<Option<OutputInfo>>) { self.latex.on_inputs_changed(vec![]) }

    fn output_info(&self, _o: usize) -> OutputInfo {
        OutputInfo {
            latex: self.selected.latex(),
            ty: PinType::Menge,
            set_id: Some(self.selected.to_set_id())
        }
    }

    fn show_input(&mut self, _: &InPin, _: &mut Ui) { unreachable!() }
    fn show_output(&mut self, pin: &OutPin, ui: &mut Ui) {
        // Anzeige als LaTeX
        self.latex.on_inputs_changed(vec![Some(self.output_info(0))]);
        self.latex.show_output(pin, ui);
    }

    fn show_body(&mut self, node: egui_snarl::NodeId, inputs: &[InPin],outputs: &[OutPin],ui: &mut Ui,) {
        let mut changed = false;
        // UI: Dropdown
        ComboBox::from_id_salt(("define_set", node))
            .selected_text(self.selected.label())
            .show_ui(ui, |ui| {
                for v in [
                    VordefMenge::Leer,
                    VordefMenge::Logik,
                    VordefMenge::Nat,
                    VordefMenge::Ganz,
                    VordefMenge::Rat,
                    VordefMenge::Real,
                    VordefMenge::Komplex,
                ] {
                    if ui.selectable_value(&mut self.selected, v, v.label()).changed() {
                        changed = true;
                    }
                }
            });
        
        if changed { self.dirty = true }

    }

    fn show_header(&mut self, node: egui_snarl::NodeId, inputs: &[InPin], outputs: &[OutPin],ui: &mut Ui) {
        self.latex.show_header(node, inputs, outputs, ui);
    }

    fn show_footer(&mut self, node: egui_snarl::NodeId, inputs: &[InPin], outputs: &[OutPin],ui: &mut Ui) {
        
    }

    fn take_dirty(&mut self) -> bool { std::mem::take(&mut self.dirty) }
    fn as_any(&mut self) -> &mut dyn Any { self }
}

struct DefineSetProvider;
impl LatexSourceProvider for DefineSetProvider {
    fn title(&self, _inputs: &[OutputInfo]) -> Option<String> { Some(r"\textbf{ZFC Menge}".into()) }
    fn body(&self, _: &[OutputInfo]) -> Option<String> { None }
    fn footer(&self, _: &[OutputInfo]) -> Option<String> { Some(String::new()) }
    fn in_pin_label(&self, _: usize, _: &[OutputInfo]) -> Option<String> { None }
    fn out_pin_label(&self, _: usize, inputs: &[OutputInfo]) -> Option<String> { Some(erhalte_mengenlatex(inputs)) }
    fn in_pins(&self, _: &[OutputInfo]) -> usize { 0 }
    fn out_pins(&self, _: &[OutputInfo]) -> usize { 1 }
}

fn erhalte_mengenlatex(inputs: &[OutputInfo]) -> String { 
    return inputs.get(0).map(|i| i.latex.clone()).unwrap_or_else(|| menge::leer()) 
}
