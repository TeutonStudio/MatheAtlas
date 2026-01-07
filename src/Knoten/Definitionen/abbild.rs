// Pfad: ../src/Definitionen/abbild.rs

use std::any::Any;

use eframe::egui::Ui;
use egui_snarl::{InPin, OutPin};

use crate::typen::{OutputInfo, PinType, SetId};
use crate::LaTeX::interpreter::{LaTeXQuelle,LaTeXQuellBereitsteller};

use crate::basis_knoten::{Knoten, KnotenDaten, KnotenInhalt, KnotenStruktur};
use crate::latex_knoten::{LatexNode};

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

impl KnotenInhalt for DefiniereAbbildNode {
    fn show_header(&mut self, node: egui_snarl::NodeId, inputs: &[InPin], outputs: &[OutPin],ui: &mut Ui) -> bool {
        return self.latex.show_header(node, inputs, outputs, ui);
    }
    fn show_body(&mut self, node: egui_snarl::NodeId, inputs: &[InPin],outputs: &[OutPin],ui: &mut Ui,) -> bool {
        return self.latex.show_body(node, inputs, outputs, ui);
    }
    fn show_footer(&mut self, node: egui_snarl::NodeId, inputs: &[InPin], outputs: &[OutPin],ui: &mut Ui) -> bool {
        return self.latex.show_footer(node, inputs, outputs, ui);
    }
    fn show_input(&mut self, pin: &InPin, ui: &mut Ui) {
        self.latex.show_input(pin, ui);
    }

    fn show_output(&mut self, pin: &OutPin, ui: &mut Ui) {
        self.latex.show_output(pin, ui);
    }
}
impl KnotenDaten for DefiniereAbbildNode {
    fn output_info(&self, _o: usize) -> OutputInfo {
        OutputInfo { latex: r"\LaTeX".to_string(), ty: self.output_type(0), set_id: None }
    }

    fn on_inputs_changed(&mut self, inputs: Vec<Option<OutputInfo>>) {
        self.inputs_cache = inputs.clone();
        self.recompute_sets();

        //let present = self.inputs_cache.iter().filter_map(|x| x.clone()).collect::<Vec<_>>();
        self.latex.on_inputs_changed(inputs);
    }
}
impl KnotenStruktur for DefiniereAbbildNode {
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
        PinType::Abbild { wertevorrat: Some(self.w.clone()), zielmenge: Some(self.z.clone()) }
    }
}
impl Knoten for DefiniereAbbildNode {
    fn as_any(&mut self) -> &mut dyn Any { self }
}

struct DefineMapProvider;
impl LaTeXQuellBereitsteller for DefineMapProvider {
    fn title(&self, _: &[&OutputInfo]) -> Option<String> { Some(r"\textbf{Abbild}".to_string()) }

    fn body(&self, inputs: &[&OutputInfo]) -> Option<String> {
        let w = inputs.get(0).map(|i| i.latex.as_str()).unwrap_or("W");
        let z = inputs.get(1).map(|i| i.latex.as_str()).unwrap_or("Z");
        let y = inputs.get(2).map(|i| i.latex.as_str()).unwrap_or("y");

        // konstante Abbildung über W -> Z: x in W |-> y (mit y in Z)
        Some(format!(r"$f: {w}\to {z},\quad x\mapsto {y}$"))
    }

    fn footer(&self, _: &[&OutputInfo]) -> Option<String> { Some(String::new()) }

    fn in_pin_label(&self, i: usize, _: &[&OutputInfo]) -> Option<String> {
        match i {
            0 => Some(r"$W$".into()),
            1 => Some(r"$Z$".into()),
            2 => Some(r"$y$".into()),
            _ => Some(r"$?$".into()),
        }
    }

    fn out_pin_label(&self, _: usize, _: &[&OutputInfo]) -> Option<String> { Some(r"$f$".into()) }

    fn in_pins(&self) -> usize { 3 }
    fn out_pins(&self) -> usize { 1 }
}
