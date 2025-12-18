// Pfad: ../src/Knoten/operator-knoten.rs

use eframe::egui::{Ui};
use egui_snarl::{InPin, OutPin, NodeId};

use crate::LaTeX::interpreter::{LaTeXQuelle,LaTeXQuellBereitsteller};
use crate::basis_knoten::{KnotenInhalt};
use crate::latex_knoten::{LatexNode};


pub struct OperatorNode {
    name: String,
    latex: LatexNode,
    //inputs_cache: Vec<Option<OutputInfo>>,
    show_def: bool,

    // dynamische Pin-Anzahlen
    in_count: usize,
    out_count: usize,

}

impl OperatorNode {
    pub fn new(name: impl Into<String>, latex_provider: Box<dyn LaTeXQuellBereitsteller>) -> Self {
        let name = name.into();
        Self {
            name: name.clone(),
            latex: LatexNode::new(name, latex_provider),
            show_def: false,
            in_count: 1,
            out_count: 1,
        }
    }
}

impl KnotenInhalt for OperatorNode {
    fn show_input(&mut self, pin: &InPin, ui: &mut Ui) {
        self.latex.show_input(pin, ui);
    }

    fn show_output(&mut self, pin: &OutPin, ui: &mut Ui) {
        self.latex.show_output(pin, ui);
    }

    fn show_header(&mut self, node: NodeId, inputs: &[InPin], outputs: &[OutPin],ui: &mut Ui) {
        self.latex.title.show_clickable(ui);
        // self.show_header(node, inputs, outputs, ui);
    }

    fn show_body(&mut self, node: NodeId, inputs: &[InPin], outputs: &[OutPin],ui: &mut Ui,) {
        self.show_body(node, inputs, outputs, ui);
    }

    fn show_footer(&mut self, node: NodeId, inputs: &[InPin], outputs: &[OutPin],ui: &mut Ui) {
        self.latex.show_footer(node, inputs, outputs, ui);
    }
}
