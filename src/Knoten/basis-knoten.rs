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
    
    fn output_info(&self, output: usize) -> OutputInfo;
    fn on_inputs_changed(&mut self, inputs: Vec<Option<OutputInfo>>);
    fn take_dirty(&mut self) -> bool { false }

    /// Für Downcasting (leider nötig mit Trait-Objekten)
    fn as_any(&mut self) -> &mut dyn Any;
}


