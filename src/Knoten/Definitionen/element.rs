// Pfad: ../src/Definitionen/abbild.rs

use std::any::Any;

use eframe::egui::{Ui,Color32, ComboBox};
use egui_snarl::{InPin, OutPin};

use crate::typen::{OutputInfo, PinType, SetId};
use crate::LaTeX::{logik,menge};

use crate::LaTeX::interpreter::{LaTeXQuelle,LaTeXQuellBereitsteller};
use crate::basis_knoten::{KnotenInhalt, KnotenStruktur, KnotenDaten, Knoten};
use crate::latex_knoten::{LatexNode};


/// Definiere Element:
/// - Input: Menge
/// - Output: Element
/// - Anfangs: zeigt Symbol (z.B. x). Tap -> TextEdit + OK.
pub struct DefiniereElementNode {
    latex: LatexNode,
    inputs_cache: Vec<Option<OutputInfo>>,

    editing: bool,
    //menge: Option<SetId>,
    buffer: String,
    symbol: String,
}

impl DefiniereElementNode {
    pub fn new() -> Self { 
        Self { 
            latex: LatexNode::new("Definiere Element", Box::new(DefineElemProvider)), 
            inputs_cache: vec![], 
            editing: false, 
            //menge: None, 
            buffer: "x".into(), 
            symbol: "x".into(), 
        } 
    }

    fn current_set_id(&self) -> Option<SetId> {
        self.inputs_cache
            .get(0)
            .and_then(|x| x.as_ref())
            .and_then(|info| match info.ty {
                PinType::Menge => info.set_id(),
                _ => None,
            })
    }

    fn current_set_latex(&self) -> String {
        // Menge-LaTeX bevorzugt aus dem Input (damit Custom sauber durchläuft)
        self.inputs_cache
            .get(0)
            .and_then(|x| x.as_ref())
            .map(|info| info.latex.clone())
            .unwrap_or_else(|| menge::leer())
    }

    fn is_connected(&self) -> bool {
        self.inputs_cache.get(0).and_then(|x| x.as_ref()).is_some()
    }

    fn finite_elements(&self) -> Option<Vec<String>> {
        self.current_set_id().and_then(|s| s.elements_latex())
    }

    fn element_object_latex(&self) -> String {
        // Objekt selbst (ohne Mitgliedschaft), als LaTeX
        // Du kannst hier später Regeln erzwingen, z.B. nur ein Buchstabe etc.
        self.symbol.clone()
    }
}

impl KnotenInhalt for DefiniereElementNode {
    fn show_input(&mut self, pin: &InPin, ui: &mut Ui) {
        self.latex.show_input(pin, ui);
    }

    fn show_output(&mut self, pin: &OutPin, ui: &mut Ui) {
        self.on_inputs_changed(vec![Some(self.output_info(0))]);
        self.latex.show_output(pin, ui);
    }

    fn show_body(
        &mut self,
        _node: egui_snarl::NodeId,
        _inputs: &[InPin],
        _outputs: &[OutPin],
        ui: &mut Ui,
    ) -> bool {
        // Leere Menge: keine Outputs, also nur Hinweis (optional)
        if matches!(self.current_set_id(), Some(SetId::Leer)) {
            ui.label("∅ hat keine Elemente.");
            return false
        }

        // Endliche Menge -> Dropdown
        if let Some(elems) = self.finite_elements() {
            // Wenn die aktuelle Auswahl nicht drin ist, setze auf erstes Element
            if !elems.iter().any(|e| e == &self.symbol) {
                if let Some(first) = elems.first() {
                    self.symbol = first.clone();
                }
            }

            ComboBox::from_id_salt("finite_element_select")
                .selected_text(self.symbol.clone())
                .show_ui(ui, |ui| {
                    for e in elems {
                        ui.selectable_value(&mut self.symbol, e.clone(), e);
                    }
                });

            // Bei endlicher Menge kein Editing-Modus nötig
            self.editing = false;
        }

        // Unendliche/unklare Menge -> Edit-Feld (wie gehabt)
        ui.horizontal(|ui| {
            if !self.editing {
                if ui.button(format!("Symbol: {}", self.symbol)).clicked() {
                    self.buffer = self.symbol.clone();
                    self.editing = true;
                }
            } else {
                ui.text_edit_singleline(&mut self.buffer);
                if ui.button("OK").clicked() {
                    self.symbol = self.buffer.clone();
                    self.editing = false;
                }
            }
        });
        return false
    }

    fn show_header(&mut self, node: egui_snarl::NodeId, inputs: &[InPin], outputs: &[OutPin], ui: &mut Ui) -> bool {
        return self.latex.show_header(node, inputs, outputs, ui)
    }

    fn show_footer(&mut self, node: egui_snarl::NodeId, inputs: &[InPin], outputs: &[OutPin],ui: &mut Ui) -> bool {
        return false
    }
}

impl KnotenDaten for DefiniereElementNode {
    fn on_inputs_changed(&mut self, inputs: Vec<Option<OutputInfo>>) {
        self.inputs_cache = inputs;

        let mut present = Vec::new();
        for opt in &self.inputs_cache {
            if opt.is_some() {
                present.push(opt.clone());
            }
        }

        // self.latex.on_inputs_changed(present);
    }

    fn output_info(&self, _o: usize) -> OutputInfo {
        let menge_ltx = self.current_set_latex();
        let obj_ltx = self.element_object_latex();

        OutputInfo {
            latex: logik::element(obj_ltx, menge_ltx),
            ty: self.output_type(0),
            set_id: None,
        }
    }

    fn take_dirty(&mut self) -> bool {
        false
    }
}

impl KnotenStruktur for DefiniereElementNode {
    fn name(&self) -> &str { "Definiere Element" }
    fn inputs(&self) -> usize { 1 }

    fn outputs(&self) -> usize {
        match self.current_set_id() {
            Some(SetId::Leer) => 0,
            _ => 1,
        }
    }

    fn input_type(&self, _i: usize) -> PinType { PinType::Menge }

    fn output_type(&self, _o: usize) -> PinType {
        match self.current_set_id() {
            None => PinType::Element,
            Some(set) => match set {
                SetId::Any => PinType::Element,
                SetId::Logik => PinType::Logik,
                SetId::Leer => PinType::Element, // wird eh outputs()=0
                SetId::Nat  => PinType::Zahl { raum: SetId::Nat },
                SetId::Ganz => PinType::Zahl { raum: SetId::Ganz },
                SetId::Rat  => PinType::Zahl { raum: SetId::Rat },
                SetId::Real => PinType::Zahl { raum: SetId::Real },
                SetId::Komplex => PinType::Zahl { raum: SetId::Komplex },
                _ => PinType::Element,
            }
        }
    }
}

impl Knoten for DefiniereElementNode {
    fn as_any(&mut self) -> &mut dyn Any { self }
}

struct DefineElemProvider;
impl LaTeXQuellBereitsteller for DefineElemProvider {
    fn title(&self, inputs: &[&OutputInfo]) -> Option<String> {
        Some(r"\textbf{Element}".to_string())
        /*if let Some(set) = inputs.get(0) {
            Some(format!(r"\textbf{{Element in}} {}", set.latex))
        } else {
            Some(r"\textbf{Element}".into())
        }*/
    }

    fn body(&self, inputs: &[&OutputInfo]) -> Option<String> {
        Some(inputs.get(0).map(|i| i.latex.clone()).unwrap_or_else(|| r"x".into()))
    }

    fn footer(&self, _: &[&OutputInfo]) -> Option<String> {
        Some(String::new())
    }

    // Input-Label:
    // - unverbunden -> ∅
    // - verbunden   -> nichts
    fn in_pin_label(&self, _: usize, inputs: &[&OutputInfo]) -> Option<String> {
        None
        /*if inputs.is_empty() {
            Some(menge::leer())
        } else {
            None
        }*/
    }

    fn out_pin_label(&self, _: usize, outputs: &[&OutputInfo]) -> Option<String> {
        if let Some(set) = outputs.get(0) {
            Some(set.latex.clone())
        } else {
            None
        }
    }

    fn in_pins(&self) -> usize { 1 }
    fn out_pins(&self) -> usize { 1 }
}

