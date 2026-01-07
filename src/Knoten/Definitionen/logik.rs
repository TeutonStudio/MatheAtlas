// Pfad: ../src/Definitionen/logik.rs

use std::{any::Any, rc::Rc};

use eframe::egui::Ui;
use egui_snarl::{InPin, OutPin};

use crate::LaTeX::interpreter::{LaTeXQuelle,LaTeXQuellBereitsteller};
use crate::typen::{OutputInfo, PinType, SetId};

use crate::basis_knoten::{Knoten, KnotenInhalt, KnotenDaten, KnotenStruktur};
use crate::latex_knoten::{LatexNode};

pub struct WahrNode {
    latex: LatexNode
}

impl WahrNode {
    pub fn new(eingang: bool, ausgang: bool) -> Self {
        Self { latex: LatexNode::new("Wahr", Rc::new(WahrQuelle::new(eingang,ausgang))) }
    }
}

struct WahrQuelle {
    eingang: bool,
    ausgang: bool,
}
impl WahrQuelle {
    pub fn new(eingang: bool, ausgang: bool) -> Self { Self { eingang, ausgang } }
}
impl LaTeXQuellBereitsteller for WahrQuelle {
    fn title(&self, _: &[&OutputInfo]) -> Option<String> { Some(r"\textbf{Logik}".into()) }
    fn body(&self, _: &[&OutputInfo]) -> Option<String> { Some(crate::LaTeX::logik::wahr()) }
    // fn footer(&self, _: &[OutputInfo]) -> Option<String> {  }
    // fn in_pin_label(&self, _: usize, _: &[OutputInfo]) -> Option<String> {  }
    // fn out_pin_label(&self, _: usize, _: &[OutputInfo]) -> Option<String> {  }
    fn in_pins(&self) -> usize { if self.eingang { 1 } else { 0 } }
    fn out_pins(&self) -> usize { if self.ausgang { 1 } else { 0 } }
}

impl KnotenInhalt for WahrNode {
    fn show_input(&mut self, pin: &InPin, ui: &mut Ui) { self.latex.show_input(pin, ui); }
    fn show_output(&mut self, pin: &OutPin, ui: &mut Ui) { self.latex.show_output(pin, ui); }
    fn show_header(&mut self, node: egui_snarl::NodeId, inputs: &[InPin], outputs: &[OutPin],ui: &mut eframe::egui::Ui) -> bool { return false }
    fn show_body(&mut self, node: egui_snarl::NodeId, inputs: &[InPin],outputs: &[OutPin],ui: &mut eframe::egui::Ui,) -> bool{ return self.latex.show_body(node, inputs, outputs, ui) }
    fn show_footer(&mut self, node: egui_snarl::NodeId, inputs: &[InPin], outputs: &[OutPin],ui: &mut eframe::egui::Ui) -> bool { return false }
}
impl KnotenDaten for WahrNode {
    fn on_inputs_changed(&mut self, _inputs: Vec<Option<OutputInfo>>) {}

    fn output_info(&self, _o: usize) -> OutputInfo {
        return OutputInfo { latex: r"$\mathrm{wahr}$".into(), ty: PinType::Logik, value: None, set: None, set_id: Some(SetId::Logik) }
    }
}
impl KnotenStruktur for WahrNode {
    fn name(&self) -> &str { "Wahr" }
    fn inputs(&self) -> usize { self.latex.provider.in_pins() }
    fn outputs(&self) -> usize { self.latex.provider.out_pins() }

    fn input_type(&self, _i: usize) -> PinType { PinType::Logik }
    fn output_type(&self, _o: usize) -> PinType { PinType::Logik }
}
impl Knoten for WahrNode {
    fn as_any(&mut self) -> &mut dyn Any { self }
}
pub struct LügeNode {
    latex: LatexNode
}

impl LügeNode {
    pub fn new(eingang: bool, ausgang: bool) -> Self {
        Self { latex: LatexNode::new("Lüge", Rc::new(LügeQuelle::new(eingang,ausgang))) }
    }
}

struct LügeQuelle {
    eingang: bool,
    ausgang: bool,
}
impl LügeQuelle {
    pub fn new(eingang: bool, ausgang: bool) -> Self { LügeQuelle { eingang, ausgang } }
}
impl LaTeXQuellBereitsteller for LügeQuelle {
    fn title(&self, _: &[&OutputInfo]) -> Option<String> { Some(r"\textbf{Logik}".into()) }
    fn body(&self, _: &[&OutputInfo]) -> Option<String> { Some(crate::LaTeX::logik::lüge()) }
    // fn footer(&self, _: &[OutputInfo]) -> Option<String> {  }
    // fn in_pin_label(&self, _: usize, _: &[OutputInfo]) -> Option<String> {  }
    // fn out_pin_label(&self, _: usize, _: &[OutputInfo]) -> Option<String> {  }
    fn in_pins(&self) -> usize { if self.eingang { 1 } else { 0 } }
    fn out_pins(&self) -> usize { if self.ausgang { 1 } else { 0 } }
}

impl KnotenInhalt for LügeNode {
    fn show_input(&mut self, pin: &InPin, ui: &mut Ui) { self.latex.show_input(pin, ui); }
    fn show_output(&mut self, pin: &OutPin, ui: &mut Ui) { self.latex.show_output(pin, ui); }
    fn show_header(&mut self, node: egui_snarl::NodeId, inputs: &[InPin], outputs: &[OutPin],ui: &mut eframe::egui::Ui) -> bool { return false }
    fn show_body(&mut self, node: egui_snarl::NodeId, inputs: &[InPin],outputs: &[OutPin],ui: &mut eframe::egui::Ui,) -> bool { return self.latex.show_body(node, inputs, outputs, ui); }
    fn show_footer(&mut self, node: egui_snarl::NodeId, inputs: &[InPin], outputs: &[OutPin],ui: &mut eframe::egui::Ui) -> bool { return false }
}
impl KnotenDaten for LügeNode {
    fn on_inputs_changed(&mut self, _inputs: Vec<Option<OutputInfo>>) {}

    fn output_info(&self, _o: usize) -> OutputInfo {
        return OutputInfo { latex: r"$\mathrm{lüge}$".into(), ty: PinType::Logik, value: None, set: None, set_id: Some(SetId::Logik) }
    }
}
impl KnotenStruktur for LügeNode {
    fn name(&self) -> &str { "Lüge" }
    fn inputs(&self) -> usize { self.latex.provider.in_pins() }
    fn outputs(&self) -> usize { self.latex.provider.out_pins() }

    fn input_type(&self, _i: usize) -> PinType { PinType::Logik }
    fn output_type(&self, _o: usize) -> PinType { PinType::Logik }
}
impl Knoten for LügeNode {
    fn as_any(&mut self) -> &mut dyn Any { self }
}
