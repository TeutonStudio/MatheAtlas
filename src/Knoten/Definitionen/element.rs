// Pfad: ../src/Definitionen/abbild.rs

use std::any::Any;

use eframe::egui::{Ui,Color32};
use egui_snarl::{InPin, OutPin};

use crate::typen::{OutputInfo, PinType, SetId};

use crate::basis_knoten::Knoten;
use crate::latex_knoten::{LatexNode, LatexSourceProvider};


/// Definiere Element:
/// - Input: Menge
/// - Output: Element
/// - Anfangs: zeigt Symbol (z.B. x). Tap -> TextEdit + OK.
pub struct DefiniereElementNode {
    latex: LatexNode,
    inputs_cache: Vec<Option<OutputInfo>>,

    editing: bool,
    buffer: String,
    symbol: String,
}

impl DefiniereElementNode {
    pub fn new() -> Self {
        Self {
            latex: LatexNode::new("Definiere Element", Box::new(DefineElemProvider)),
            inputs_cache: vec![],
            editing: false,
            buffer: "x".into(),
            symbol: "x".into(),
        }
    }

    fn current_set_id(&self) -> Option<SetId> {
        self.inputs_cache.get(0).and_then(|x| x.as_ref()).and_then(|info| match info.ty {
            PinType::Menge => info.set_id(), // du brauchst helper: OutputInfo->SetId, oder TODO
            _ => None,
        })
    }

    fn validate_membership(&self, _set: Option<SetId>, _sym: &str) -> bool {
        // Für jetzt: nur bei Logik-Menge wirklich validieren
        // Alles andere: akzeptieren (CAS kommt später)
        true
    }
}

impl Knoten for DefiniereElementNode {
    fn name(&self) -> &str { "Definiere Element" }
    fn inputs(&self) -> usize { 1 }
    fn outputs(&self) -> usize { 1 }

    fn input_type(&self, _i: usize) -> PinType { PinType::Menge }
    fn output_type(&self, _o: usize) -> PinType { PinType::Element }

    fn on_inputs_changed(&mut self, inputs: Vec<Option<OutputInfo>>) {
        self.inputs_cache = inputs;
        let present = self.inputs_cache.iter().filter_map(|x| Some(x.clone())).collect::<Vec<_>>();
        self.latex.on_inputs_changed(present);
    }

    fn output_info(&self, _o: usize) -> OutputInfo {
        OutputInfo { latex: format!(r"${}$", self.symbol), ty: PinType::Element, set_id: None }
    }

    fn show_input(&mut self, pin: &InPin, ui: &mut Ui) {
        self.latex.show_input(pin, ui);
    }

    fn show_output(&mut self, pin: &OutPin, ui: &mut Ui) {
        // Anzeige + Edit
        ui.horizontal(|ui| {
            if !self.editing {
                if ui.button(format!("Symbol: {}", self.symbol)).clicked() {
                    self.buffer = self.symbol.clone();
                    self.editing = true;
                }
            } else {
                ui.text_edit_singleline(&mut self.buffer);
                if ui.button("OK").clicked() {
                    let ok = self.validate_membership(self.current_set_id(), &self.buffer);
                    if ok {
                        self.symbol = self.buffer.clone();
                        self.editing = false;
                    } else {
                        ui.colored_label(Color32::RED, "Ungültig für Menge");
                    }
                }
            }
        });

        self.latex.on_inputs_changed(vec![Some(self.output_info(0))]);
        self.latex.show_output(pin, ui);
    }

    fn show_body(&mut self, node: egui_snarl::NodeId, inputs: &[InPin],outputs: &[OutPin],ui: &mut Ui,) {
        
    }

    fn show_header(&mut self, node: egui_snarl::NodeId, inputs: &[InPin], outputs: &[OutPin],ui: &mut Ui) {
        
    }

    fn as_any(&mut self) -> &mut dyn Any { self }
}

struct DefineElemProvider;
impl LatexSourceProvider for DefineElemProvider {
    fn title(&self, inputs: &[OutputInfo]) -> Option<String> {
        if let Some(set) = inputs.get(0) {
            Some(format!(r"\textbf{{Element in}} {}", set.latex))
        } else {
            Some(r"\textbf{Element}".into())
        }
    }
    fn body(&self, inputs: &[OutputInfo]) -> Option<String> {
        // Hier wird der Element-Output als "Input" reingereicht (siehe show_output)
        Some(inputs.get(0).map(|i| i.latex.clone()).unwrap_or_else(|| r"x".into()))
    }
    fn footer(&self, _: &[OutputInfo]) -> Option<String> { Some(r"\in]".to_string()) }
    fn in_pin_label(&self, _: usize, _: &[OutputInfo]) -> Option<String> { Some(r"A".into())  }
    fn out_pin_label(&self, _: usize, _: &[OutputInfo]) -> Option<String> { Some(r"x".into()) }
    fn in_pins(&self, _: &[OutputInfo]) -> usize { 1 }
    fn out_pins(&self, _: &[OutputInfo]) -> usize { 1 }
}
