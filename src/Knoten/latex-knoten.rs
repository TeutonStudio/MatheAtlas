// Pfad: ../src/Knoten/latex-knoten.rs

use eframe::egui::Ui;
use egui_snarl::{InPin, OutPin, NodeId};

use crate::LaTeX::interpreter::{LaTeXQuelle,LaTeXQuellBereitsteller};

use crate::typen::{OutputInfo};
use crate::basis_knoten::{KnotenInhalt};


/// Trait: Die Anwendung liefert hiermit LaTeX-Strings basierend auf Inputs.
/// (Du wolltest: App generiert Strings, Node rendert nur.)

/// Ein Bereich (Title/Body/Footer/Pinlabel) als gerenderte Grafik mit Cache.



/// LatexNode: rendert Title/Body/Footer + Pin-Labels als LaTeX → SVG → Texture.
pub struct LatexNode {
    name: String,

    provider: Box<dyn LaTeXQuellBereitsteller>,
    inputs: Vec<OutputInfo>,
    
    title: LaTeXQuelle,
    body: LaTeXQuelle,
    footer: LaTeXQuelle,

    in_pin_sections: Vec<LaTeXQuelle>,
    out_pin_sections: Vec<LaTeXQuelle>,

    had_error: bool,
}

impl LatexNode {
    pub fn new(name: impl Into<String>, provider: Box<dyn LaTeXQuellBereitsteller>) -> Self {
        Self {
            name: name.into(),
            provider,
            inputs: vec![],
            title: LaTeXQuelle::new(),
            body: LaTeXQuelle::new(),
            footer: LaTeXQuelle::new(),
            in_pin_sections: vec![LaTeXQuelle::new()],
            out_pin_sections: vec![LaTeXQuelle::new()],
            had_error: false,
        }
    }
}

impl KnotenInhalt for LatexNode {

    fn show_input(&mut self, pin: &InPin, ui: &mut Ui) {
        if let Some(section) = self.in_pin_sections.get_mut(pin.id.input) {
            section.show(ui);
        } else { ui.label("?"); }
    }

    fn show_output(&mut self, pin: &OutPin, ui: &mut Ui) {
        if let Some(section) = self.out_pin_sections.get_mut(pin.id.output) {
            section.show(ui);
        } else { ui.label("?"); }
    }

    fn show_body(&mut self, node: NodeId, inputs: &[InPin],outputs: &[OutPin],ui: &mut Ui,) { self.body.show(ui) }

    fn show_header(&mut self, node: NodeId, inputs: &[InPin], outputs: &[OutPin],ui: &mut Ui) { self.title.show(ui) }

    fn show_footer(&mut self, node: NodeId, inputs: &[InPin], outputs: &[OutPin],ui: &mut Ui) { self.footer.show(ui) }

}
