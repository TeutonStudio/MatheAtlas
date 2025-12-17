// Pfad: ../src/Knoten/basis-knoten.rs

use eframe::egui::{DragValue, Ui};
use egui_snarl::{InPin, OutPin, NodeId};
use std::any::Any;

use crate::typen::{PinType,OutputInfo,SetId};


/// Gemeinsames Interface für ALLE Knoten
pub trait Knoten {
    fn name(&self) -> &str;

    fn inputs(&self) -> usize;
    fn outputs(&self) -> usize;

    fn input_type(&self, _i: usize) -> PinType;
    fn output_type(&self, _o: usize) -> PinType;

    fn show_input(&mut self, pin: &InPin, ui: &mut Ui);
    fn show_output(&mut self, pin: &OutPin, ui: &mut Ui);
    fn show_body(&mut self, node: NodeId, inputs: &[InPin],outputs: &[OutPin],ui: &mut Ui,);
    fn show_header(&mut self, node: NodeId, inputs: &[InPin], outputs: &[OutPin],ui: &mut Ui);
    
    fn on_inputs_changed(&mut self, inputs: Vec<Option<OutputInfo>>);
    fn output_info(&self, output: usize) -> OutputInfo;

    /// Für Downcasting (leider nötig mit Trait-Objekten)
    fn as_any(&mut self) -> &mut dyn Any;
}



/* -------------------------
   Demo-Knoten
--------------------------*/

pub struct NumberNode {
    pub value: f64,
}

impl NumberNode {
    pub fn new() -> Self {
        Self { value: 0.0 }
    }
}

impl Knoten for NumberNode {
    fn name(&self) -> &str {
        "Number"
    }

    fn inputs(&self) -> usize {
        0
    }

    fn outputs(&self) -> usize {
        1
    }

    fn input_type(&self, _i: usize) -> PinType {
        return PinType::Element;
    }

    fn output_type(&self, _o: usize) -> PinType {
        return PinType::Zahl { raum: SetId::Any };
    }

    fn show_input(&mut self, _: &InPin, _: &mut Ui) {
        unreachable!()
    }

    fn show_output(&mut self, _: &OutPin, ui: &mut Ui) {
        ui.add(DragValue::new(&mut self.value));
    }

    fn show_body(&mut self, node: NodeId, inputs: &[InPin],outputs: &[OutPin],ui: &mut Ui,) {
        
    }

    fn show_header(&mut self, node: NodeId, inputs: &[InPin], outputs: &[OutPin],ui: &mut Ui) {
        
    }

    fn on_inputs_changed(&mut self, _inputs: Vec<Option<OutputInfo>>) {}
    fn output_info(&self, _output: usize) -> OutputInfo {
        OutputInfo { latex: r"\latex".to_string(), ty: PinType::Element, set_id: None }
    }


    fn as_any(&mut self) -> &mut dyn Any {
        self
    }
}

pub struct SinkNode;

impl SinkNode {
    pub fn new() -> Self {
        Self
    }
}

impl Knoten for SinkNode {
    fn name(&self) -> &str {
        "Sink"
    }

    fn inputs(&self) -> usize {
        1
    }

    fn outputs(&self) -> usize {
        0
    }

    fn input_type(&self, _i: usize) -> PinType {
        return PinType::Element;
    }

    fn output_type(&self, _o: usize) -> PinType {
        return PinType::Zahl { raum: SetId::Any };
    }

    fn show_input(&mut self, _: &InPin, ui: &mut Ui) {
        ui.label("Input");
    }

    fn show_output(&mut self, _: &OutPin, _: &mut Ui) {
        unreachable!()
    }

    fn show_body(&mut self, node: NodeId, inputs: &[InPin],outputs: &[OutPin],ui: &mut Ui,) {
        
    }

    fn show_header(&mut self, node: NodeId, inputs: &[InPin], outputs: &[OutPin],ui: &mut Ui) {
        
    }

    fn on_inputs_changed(&mut self, _inputs: Vec<Option<OutputInfo>>) {}
    fn output_info(&self, _output: usize) -> OutputInfo {
        OutputInfo { latex: r"\latex".to_string(), ty: PinType::Element, set_id: None }
    }


    fn as_any(&mut self) -> &mut dyn Any {
        self
    }
}
