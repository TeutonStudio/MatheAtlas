// Pfad: ../src/Knoten/operator-knoten.rs

use eframe::egui::{Ui, Window, Vec2};
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
    last_def_window_min: Option<eframe::egui::Pos2>,
}


impl OperatorNode {
    pub fn new(
        name: impl Into<String>, 
        latex_provider: Box<dyn LaTeXQuellBereitsteller>,
        def_snarl: Snarl<Box<dyn Knoten>>,
    ) -> Self {
        let name = name.into();
 
        let mut ausgabe = Self {
            name: name.clone(),
            latex: LatexNode::new(name, latex_provider),
            show_def: false,
            def_snarl,
            last_def_window_min: None,
        };
        ausgabe.latex.titel_klickbar_machen(true);
        return ausgabe
    }

    pub fn name(&self) -> &str { return self.latex.name() }

fn öffne_definitionsfenster(&mut self, ui: &mut Ui) {
    let title = format!("Definition: {}", self.name);

    if let Some(inner) = Window::new(title)
        .open(&mut self.show_def)
        .resizable(true)
        .show(ui.ctx(), |ui| {
            ui.add_enabled_ui(false, |ui| {
                show_definitions_karte(&mut self.def_snarl, ui);
            });
        })
    {
        let this_min = inner.response.rect.min;

        if let Some(last_min) = self.last_def_window_min {
            let delta: Vec2 = this_min - last_min;

            if delta != Vec2::ZERO {
                // Wichtig: pos ist in Node<T>, nicht im value T.
                for (_id, node) in self.def_snarl.nodes_ids_data_mut() {
                    node.pos += delta *  3.0 / 5.0; // halbiere Verschiebung für sanfteres Verhalten
                }

                ui.ctx().request_repaint(); // optional, aber nett
            }
        }

        self.last_def_window_min = Some(this_min);
    } else {
        // Window ist zu -> Reset
        self.last_def_window_min = None;
    }
}
}

impl KnotenInhalt for OperatorNode {
    fn show_input(&mut self, pin: &InPin, ui: &mut Ui) { self.latex.show_input(pin, ui) }
    fn show_output(&mut self, pin: &OutPin, ui: &mut Ui) { self.latex.show_output(pin, ui) }
    fn show_header(&mut self, node: NodeId, inputs: &[InPin], outputs: &[OutPin],ui: &mut Ui) -> bool {
        let clicked = self.latex.show_header(node, inputs, outputs, ui);
        if clicked { self.show_def = true }
        if self.show_def { self.öffne_definitionsfenster(ui) }
        return clicked
    }
    fn show_body(&mut self, node: NodeId, inputs: &[InPin], outputs: &[OutPin],ui: &mut Ui,) -> bool { self.latex.show_body(node, inputs, outputs, ui) }
    fn show_footer(&mut self, node: NodeId, inputs: &[InPin], outputs: &[OutPin],ui: &mut Ui) -> bool { self.latex.show_footer(node, inputs, outputs, ui) }
}
