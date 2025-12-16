// Pfad: ../src/Definitionen/abbild.rs

use std::any::Any;

use crate::egui::Ui;
use egui_snarl::{InPin, OutPin};

use crate::typen::{OutputInfo, PinType, SetId};

use crate::basis_knoten::Knoten;
use crate::latex_knoten::{LatexNode, LatexSourceProvider};

/// Definiere Abbild:
/// Inputs:
/// 0: Wertevorrat (Menge)
/// 1: Zielmenge (Menge)
/// 2: Wert (Element)  -> wird als "konstanter Wert" genutzt
/// Output:
/// Abbild(W->Z)
pub struct DefiniereAbbildNode {
    latex: LatexNode,
    inputs_cache: Vec<Option<OutputInfo>>,
    w: SetId,
    z: SetId,
}

impl DefiniereAbbildNode {
    pub fn new() -> Self {
        Self {
            latex: LatexNode::new("Definiere Abbild", Box::new(DefineMapProvider)),
            inputs_cache: vec![],
            w: SetId::Any,
            z: SetId::Any,
        }
    }

    fn recompute_sets(&mut self) {
        // Wenn Inputs Mengen sind, versuchen wir SetId zu extrahieren.
        // Das hängt davon ab, wie du Mengen repräsentierst.
        // Minimal: wenn OutputInfo ein SetId tragen kann.
        if let Some(info) = self.inputs_cache.get(0).and_then(|x| x.clone()) {
            if let Some(id) = info.try_set_id() { self.w = id; }
        }
        if let Some(info) = self.inputs_cache.get(1).and_then(|x| x.clone()) {
            if let Some(id) = info.try_set_id() { self.z = id; }
        }
    }
}

impl Knoten for DefiniereAbbildNode {
    fn name(&self) -> &str { "Definiere Abbild" }

    fn inputs(&self) -> usize { 3 }
    fn outputs(&self) -> usize { 1 }

    fn input_type(&self, i: usize) -> PinType {
        match i {
            0 | 1 => PinType::Menge,
            2 => PinType::Element,
            _ => PinType::Element,
        }
    }

    fn output_type(&self, _o: usize) -> PinType {
        PinType::Abbild { wertevorrat: self.w, zielmenge: self.z }
    }

    fn on_inputs_changed(&mut self, inputs: Vec<Option<OutputInfo>>) {
        self.inputs_cache = inputs;
        self.recompute_sets();

        let present = self.inputs_cache.iter().filter_map(|x| x.clone()).collect::<Vec<_>>();
        self.latex.on_inputs_changed(present);
    }

    fn output_info(&self, _o: usize) -> OutputInfo {
        OutputInfo { latex: self.latex.current_body_latex(), ty: self.output_type(0) }
    }

    fn show_input(&mut self, pin: &InPin, ui: &mut Ui) {
        self.latex.show_input(pin, ui);
    }

    fn show_output(&mut self, pin: &OutPin, ui: &mut Ui) {
        self.latex.show_output(pin, ui);
    }

    fn as_any(&mut self) -> &mut dyn Any { self }
}

struct DefineMapProvider;
impl LatexSourceProvider for DefineMapProvider {
    fn title(&self, _: &[OutputInfo]) -> String { r"\textbf{Abbild}".into() }

    fn body(&self, inputs: &[OutputInfo]) -> String {
        let w = inputs.get(0).map(|i| i.latex.as_str()).unwrap_or("W");
        let z = inputs.get(1).map(|i| i.latex.as_str()).unwrap_or("Z");
        let y = inputs.get(2).map(|i| i.latex.as_str()).unwrap_or("y");

        // konstante Abbildung über W -> Z: x in W |-> y (mit y in Z)
        format!(r"$f: {w}\to {z},\quad x\mapsto {y}$")
    }

    fn footer(&self, _: &[OutputInfo]) -> String { String::new() }

    fn in_pin_label(&self, i: usize, _: &[OutputInfo]) -> String {
        match i {
            0 => r"$W$".into(),
            1 => r"$Z$".into(),
            2 => r"$y$".into(),
            _ => r"$?$".into(),
        }
    }

    fn out_pin_label(&self, _: usize, _: &[OutputInfo]) -> String { r"$f$".into() }

    fn in_pins(&self, _: &[OutputInfo]) -> usize { 3 }
    fn out_pins(&self, _: &[OutputInfo]) -> usize { 1 }
}
