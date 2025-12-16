// Pfad: ../src/Operatoren/abbild.rs

use std::any::Any;

use crate::egui::Ui;
use egui_snarl::{InPin, OutPin};

use crate::typen::{OutputInfo, PinType, SetId};

use crate::basis_knoten::Knoten;
use crate::latex_knoten::{LatexNode, LatexSourceProvider};

/// Auto-Coercion Node: Wert (Element/Zahl/Logik) -> Abbild(W->Z) mit konstantem Wert.
pub struct StatischeAbbildungNode {
    latex: LatexNode,
    inputs_cache: Vec<Option<OutputInfo>>,
    wertevorrat: SetId,
    zielmenge: SetId,
}

impl StatischeAbbildungNode {
    pub fn new(werte: SetId, ziel: SetId) -> Self {
        Self {
            latex: LatexNode::new("Statische Abbildung", Box::new(StaticMapProvider)),
            inputs_cache: vec![],
            wertevorrat: werte,
            zielmenge: ziel,
        }
    }
}

impl Knoten for StatischeAbbildungNode {
    fn name(&self) -> &str { "Statische Abbildung (konstant)" }

    fn inputs(&self) -> usize { 1 }
    fn outputs(&self) -> usize { 1 }

    fn input_type(&self, _i: usize) -> PinType { PinType::Element } // Graph kann Zahl/Logik als Element behandeln
    fn output_type(&self, _o: usize) -> PinType {
        PinType::Abbild { wertevorrat: self.wertevorrat, zielmenge: self.zielmenge }
    }

    fn on_inputs_changed(&mut self, inputs: Vec<Option<OutputInfo>>) {
        self.inputs_cache = inputs;
        let present = self.inputs_cache.iter().filter_map(|x| x.clone()).collect::<Vec<_>>();
        self.latex.on_inputs_changed(present);
    }

    fn output_info(&self, _o: usize) -> OutputInfo {
        OutputInfo {
            latex: self.latex.current_body_latex(),
            ty: self.output_type(0),
        }
    }

    fn show_input(&mut self, pin: &InPin, ui: &mut Ui) { self.latex.show_input(pin, ui); }
    fn show_output(&mut self, pin: &OutPin, ui: &mut Ui) { self.latex.show_output(pin, ui); }
    fn as_any(&mut self) -> &mut dyn Any { self }
}

struct StaticMapProvider;
impl LatexSourceProvider for StaticMapProvider {
    fn title(&self, _: &[OutputInfo]) -> String { r"\textbf{Statische Abbildung}".into() }

    fn body(&self, inputs: &[OutputInfo]) -> String {
        let y = inputs.get(0).map(|i| i.latex.as_str()).unwrap_or(r"y");
        // konstante Abbildung: x \mapsto y
        format!(r"$x \mapsto {y}$")
    }

    fn footer(&self, _: &[OutputInfo]) -> String { String::new() }

    fn in_pin_label(&self, _: usize, _: &[OutputInfo]) -> String { r"$y$".into() }
    fn out_pin_label(&self, _: usize, _: &[OutputInfo]) -> String { r"$f$".into() }

    fn in_pins(&self, _: &[OutputInfo]) -> usize { 1 }
    fn out_pins(&self, _: &[OutputInfo]) -> usize { 1 }
}
