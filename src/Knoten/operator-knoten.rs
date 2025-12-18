// Pfad: ../src/Knoten/operator-knoten.rs

use eframe::egui::{Ui};
use egui_snarl::{InPin, OutPin, NodeId, Snarl, ui::{SnarlWidget, SnarlStyle}};

use crate::definitions_karte::{DefinitionsKarte, show_definitions_karte};

use crate::LaTeX::interpreter::{LaTeXQuelle,LaTeXQuellBereitsteller};
use crate::basis_knoten::{Knoten,KnotenInhalt};
use crate::latex_knoten::{LatexNode};


pub struct OperatorNode {
    name: String,
    pub latex: LatexNode,
    // in_count: usize,
    // out_count: usize,
    //inputs_cache: Vec<Option<OutputInfo>>,
    show_def: bool,
    def_snarl: Snarl<Box<dyn Knoten>>,
    // dynamische Pin-Anzahlen
}

impl OperatorNode {
    pub fn new(name: impl Into<String>, latex_provider: Box<dyn LaTeXQuellBereitsteller>) -> Self {
        let name = name.into();
        let def_snarl: Snarl<Box<dyn Knoten>> = Snarl::new();
 
        Self {
            name: name.clone(),
            latex: LatexNode::new(name, latex_provider),
            // in_count: 1,
            // out_count: 1,
            show_def: false,
            def_snarl: def_snarl,
        }
    }

    pub fn name(&self) -> &str { return self.latex.name() }
}

impl KnotenInhalt for OperatorNode {
    fn show_input(&mut self, pin: &InPin, ui: &mut Ui) { self.latex.show_input(pin, ui) }
    fn show_output(&mut self, pin: &OutPin, ui: &mut Ui) { self.latex.show_output(pin, ui) }
    fn show_header(&mut self, node: NodeId, inputs: &[InPin], outputs: &[OutPin],ui: &mut Ui) {
        let clicked = self.latex.title.show_clickable(ui);
        if clicked { self.show_def = true }
        if self.show_def {
            let title = format!("Definition: {}", self.name);

            eframe::egui::Window::new(title)
                .open(&mut self.show_def)
                .resizable(true)
                .show(ui.ctx(), |ui| {
                    // komplett read-only: keine Interaktion
                    ui.add_enabled_ui(false, |ui| {
                        show_definitions_karte(&mut self.def_snarl,ui);
                    });
                });
        }

    }
    fn show_body(&mut self, node: NodeId, inputs: &[InPin], outputs: &[OutPin],ui: &mut Ui,) { self.latex.show_body(node, inputs, outputs, ui) }
    fn show_footer(&mut self, node: NodeId, inputs: &[InPin], outputs: &[OutPin],ui: &mut Ui) { self.latex.show_footer(node, inputs, outputs, ui) }
}
