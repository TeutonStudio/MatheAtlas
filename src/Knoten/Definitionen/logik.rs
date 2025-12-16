// Pfad: ../src/Definitionen/logik.rs

use std::any::Any;

use crate::egui::Ui;
use egui_snarl::{InPin, OutPin};

use crate::typen::{OutputInfo, PinType};

use crate::basis_knoten::Knoten;
use crate::latex_knoten::{LatexNode, LatexSourceProvider};

pub struct WahrNode {
    latex: LatexNode,
}
pub struct FalschNode {
    latex: LatexNode,
}

impl WahrNode {
    pub fn new() -> Self {
        Self { latex: LatexNode::new("Wahr", Box::new(WahrProvider)) }
    }
}
impl FalschNode {
    pub fn new() -> Self {
        Self { latex: LatexNode::new("Falsch", Box::new(FalschProvider)) }
    }
}

impl Knoten for WahrNode {
    fn name(&self) -> &str { "Wahr" }
    fn inputs(&self) -> usize { 0 }
    fn outputs(&self) -> usize { 1 }

    fn input_type(&self, _i: usize) -> PinType { PinType::Element }
    fn output_type(&self, _o: usize) -> PinType { PinType::Logik }

    fn on_inputs_changed(&mut self, _inputs: Vec<Option<OutputInfo>>) {}

    fn output_info(&self, _o: usize) -> OutputInfo {
        OutputInfo { latex: r"$\mathrm{wahr}$".into(), ty: PinType::Logik }
    }

    fn show_input(&mut self, _: &InPin, _: &mut Ui) { unreachable!() }
    fn show_output(&mut self, pin: &OutPin, ui: &mut Ui) { self.latex.show_output(pin, ui); }
    fn as_any(&mut self) -> &mut dyn Any { self }
}

impl Knoten for FalschNode {
    fn name(&self) -> &str { "Falsch" }
    fn inputs(&self) -> usize { 0 }
    fn outputs(&self) -> usize { 1 }

    fn input_type(&self, _i: usize) -> PinType { PinType::Element }
    fn output_type(&self, _o: usize) -> PinType { PinType::Logik }

    fn on_inputs_changed(&mut self, _inputs: Vec<Option<OutputInfo>>) {}

    fn output_info(&self, _o: usize) -> OutputInfo {
        OutputInfo { latex: r"$\mathrm{falsch}$".into(), ty: PinType::Logik }
    }

    fn show_input(&mut self, _: &InPin, _: &mut Ui) { unreachable!() }
    fn show_output(&mut self, pin: &OutPin, ui: &mut Ui) { self.latex.show_output(pin, ui); }
    fn as_any(&mut self) -> &mut dyn Any { self }
}

struct WahrProvider;
impl LatexSourceProvider for WahrProvider {
    fn title(&self, _: &[OutputInfo]) -> String { r"\textbf{Logik}".into() }
    fn body(&self, _: &[OutputInfo]) -> String { r"$\mathrm{wahr}$".into() }
    fn footer(&self, _: &[OutputInfo]) -> String { String::new() }
    fn in_pin_label(&self, _: usize, _: &[OutputInfo]) -> String { String::new() }
    fn out_pin_label(&self, _: usize, _: &[OutputInfo]) -> String { r"$\mathrm{wahr}$".into() }
    fn in_pins(&self, _: &[OutputInfo]) -> usize { 0 }
    fn out_pins(&self, _: &[OutputInfo]) -> usize { 1 }
}

struct FalschProvider;
impl LatexSourceProvider for FalschProvider {
    fn title(&self, _: &[OutputInfo]) -> String { r"\textbf{Logik}".into() }
    fn body(&self, _: &[OutputInfo]) -> String { r"$\mathrm{falsch}$".into() }
    fn footer(&self, _: &[OutputInfo]) -> String { String::new() }
    fn in_pin_label(&self, _: usize, _: &[OutputInfo]) -> String { String::new() }
    fn out_pin_label(&self, _: usize, _: &[OutputInfo]) -> String { r"$\mathrm{falsch}$".into() }
    fn in_pins(&self, _: &[OutputInfo]) -> usize { 0 }
    fn out_pins(&self, _: &[OutputInfo]) -> usize { 1 }
}
