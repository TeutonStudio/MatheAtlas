// Pfad: ../src/Operatoren/menge.rs

use std::any::Any;

use eframe::egui::{Ui,Window};
use egui_snarl::{NodeId, InPin, OutPin};

use crate::typen::{OutputInfo, PinType};

use crate::basis_knoten::{KnotenStruktur,KnotenInhalt,Knoten};
use crate::latex_knoten::{LatexNode, LatexSourceProvider};

#[derive(Clone, Copy, Debug)]
pub enum MengenOp {
    Vereinigung,
    Schnitt,
    Differenz,
}

#[derive(Clone, Copy, Debug)]
pub enum RelOp {
    Teilmenge,   // ⊆
    Obermenge,   // ⊇
    ElementVon,  // ∈
    Gleichheit,  // =
}

/// Auto-Coercion Node: Element -> {Element}
pub struct SingletonMengeNode {
    latex: LatexNode,
    inputs_cache: Vec<Option<OutputInfo>>,
}

impl SingletonMengeNode {
    pub fn new() -> Self {
        Self {
            latex: LatexNode::new("Singleton", Box::new(SingletonProvider)),
            inputs_cache: vec![],
        }
    }
}

/*impl Knoten for SingletonMengeNode {
    fn name(&self) -> &str { "Singleton-Menge {x}" }
    fn inputs(&self) -> usize { 1 }
    fn outputs(&self) -> usize { 1 }

    fn input_type(&self, _i: usize) -> PinType { PinType::Element }
    fn output_type(&self, _o: usize) -> PinType { PinType::Menge }

    fn on_inputs_changed(&mut self, inputs: Vec<Option<OutputInfo>>) {
        self.inputs_cache = inputs;
        let present = self.inputs_cache.iter().filter_map(|x| Some(x.clone())).collect::<Vec<_>>();
        self.latex.on_inputs_changed(present);
    }

    fn output_info(&self, _o: usize) -> OutputInfo {
        let x = self.inputs_cache.get(0).and_then(|x| x.clone()).map(|i| i.latex).unwrap_or("x".into());
        OutputInfo { latex: format!(r"$\{{{x}\}}$"), ty: PinType::Menge, set_id: None }
    }

    fn show_input(&mut self, pin: &InPin, ui: &mut Ui) { self.latex.show_input(pin, ui); }
    fn show_output(&mut self, pin: &OutPin, ui: &mut Ui) { self.latex.show_output(pin, ui); }
    fn show_body(&mut self, node: egui_snarl::NodeId, inputs: &[InPin],outputs: &[OutPin],ui: &mut Ui,) {
        
    }
    fn show_header(&mut self, node: egui_snarl::NodeId, inputs: &[InPin], outputs: &[OutPin],ui: &mut Ui) {
        
    }
    fn show_footer(&mut self, node: egui_snarl::NodeId, inputs: &[InPin], outputs: &[OutPin],ui: &mut Ui) {
        
    }
    fn as_any(&mut self) -> &mut dyn Any { self }
}*/

struct SingletonProvider;
impl LatexSourceProvider for SingletonProvider {
    fn title(&self, _inputs: &[OutputInfo]) -> Option<String> { Some(r"\textbf{Singleton}".into()) }
    fn body(&self, inputs: &[OutputInfo]) -> Option<String> {
        let x = inputs.get(0).map(|i| i.latex.as_str()).unwrap_or("x");
        Some(format!(r"$\{{{x}\}}$"))
    }
    fn footer(&self, _inputs: &[OutputInfo]) -> Option<String> { Some(String::new()) }
    fn in_pin_label(&self, _: usize, _: &[OutputInfo]) -> Option<String> { Some(r"$x$".into()) }
    fn out_pin_label(&self, _: usize, _: &[OutputInfo]) -> Option<String> { Some(r"$\{x\}$".into()) }
    fn in_pins(&self, _: &[OutputInfo]) -> usize { 1 }
    fn out_pins(&self, _: &[OutputInfo]) -> usize { 1 }
}

/* -------------------------
   Mengenoperatoren
--------------------------*/

pub struct MengenOperatorNode {
    op: MengenOp,
    latex: LatexNode,
    inputs_cache: Vec<Option<OutputInfo>>,
    //show_def: bool,
    //def_snarl: egui_snarl::Snarl<Box<dyn Knoten>>,
    //def_viewer: DefinitionsKarte,
}

impl MengenOperatorNode {
    pub fn new(op: MengenOp) -> Self {
        Self {
            op,
            latex: LatexNode::new(format!("Mengen:{op:?}"), Box::new(MengenProvider { op })),
            inputs_cache: vec![],
            //show_def: false,
            //def_snarl: egui_snarl::Snarl::new("Mengen", Box::new(MengenProvider { op }))
            //def_viewer: DefinitionsKarte,
        }
    }
}

impl KnotenStruktur for MengenOperatorNode {
    fn name(&self) -> &str {
        match self.op {
            MengenOp::Vereinigung => "Vereinigung (∪)",
            MengenOp::Schnitt => "Schnitt (∩)",
            MengenOp::Differenz => "Differenz (\\)",
        }
    }

    fn inputs(&self) -> usize { 2 }
    fn outputs(&self) -> usize { 1 }

    fn input_type(&self, _i: usize) -> PinType { PinType::Menge }
    fn output_type(&self, _o: usize) -> PinType { PinType::Menge }

    fn on_inputs_changed(&mut self, inputs: Vec<Option<OutputInfo>>) {
        self.inputs_cache = inputs;
        let present = self.inputs_cache.iter().filter_map(|x| Some(x.clone())).collect::<Vec<_>>();
        //self.latex.on_inputs_changed(present);
    }

    fn output_info(&self, _o: usize) -> OutputInfo {
        OutputInfo { latex: r"\LaTeX".to_string() /*self.latex.current_body_latex()*/, ty: PinType::Menge, set_id: None }
    }
}
impl KnotenInhalt for MengenOperatorNode {
    fn show_input(&mut self, pin: &InPin, ui: &mut Ui) { self.latex.show_input(pin, ui); }
    fn show_output(&mut self, pin: &OutPin, ui: &mut Ui) { self.latex.show_output(pin, ui); }
    fn show_body(&mut self, node: egui_snarl::NodeId, inputs: &[InPin],outputs: &[OutPin],ui: &mut Ui,) {
        
    }
    fn show_header(&mut self, node: egui_snarl::NodeId, inputs: &[InPin], outputs: &[OutPin],ui: &mut Ui) {
        self.latex.show_header(node, inputs, outputs, ui);
    }
    fn show_footer(&mut self, node: egui_snarl::NodeId, inputs: &[InPin], outputs: &[OutPin],ui: &mut Ui) {
        if ui.small_button("zeige Definition").clicked() { self.show_def = true };
        if self.show_def {
            let title = format!("Definition: {}", self.name());

            egui::Window::new(title)
                .open(&mut self.show_def)
                .resizable(true)
                .vscroll(false)
                .show(ui.ctx(), |ui| {
                    ui.label("Unveränderliche Definition (read-only)");

                    ui.add_enabled_ui(false, |ui| {
                        // Komplett deaktiviert: keine Interaktion (auch kein Drag/Connect)
                        SnarlWidget::new(&mut self.def_snarl)
                            .style(SnarlStyle::default())
                            .show(ui, &mut self.def_viewer);
                    });
                });
        }
        //self.latex.show_footer(node, inputs, outputs, ui);
    }
}
impl Knoten for MengenOperatorNode {
    fn as_any(&mut self) -> &mut dyn Any { self }
}

struct MengenProvider { op: MengenOp }
impl LatexSourceProvider for MengenProvider {
    fn title(&self, _: &[OutputInfo]) -> Option<String> {
        match self.op {
            MengenOp::Vereinigung => Some(r"\textbf{Vereinigung}".into()),
            MengenOp::Schnitt => Some(r"\textbf{Schnitt}".into()),
            MengenOp::Differenz => Some(r"\textbf{Differenz}".into()),
        }
    }

    fn body(&self, inputs: &[OutputInfo]) -> Option<String> {
        let a = inputs.get(0).map(|i| i.latex.as_str()).unwrap_or("A");
        let b = inputs.get(1).map(|i| i.latex.as_str()).unwrap_or("B");
        match self.op {
            MengenOp::Vereinigung => Some(format!(r"$\left({a}\right)\cup\left({b}\right)$")),
            MengenOp::Schnitt => Some(format!(r"$\left({a}\right)\cap\left({b}\right)$")),
            MengenOp::Differenz => Some(format!(r"$\left({a}\right)\setminus\left({b}\right)$")),
        }
    }

    fn footer(&self, _: &[OutputInfo]) -> Option<String> { Some(String::new()) }

    fn in_pin_label(&self, idx: usize, _: &[OutputInfo]) -> Option<String> {
        if idx == 0 { Some(r"$A$".into()) } else { Some(r"$B$".into()) }
    }

    fn out_pin_label(&self, _: usize, _: &[OutputInfo]) -> Option<String> { Some(r"$\mathrm{out}$".into()) }
    fn in_pins(&self, _: &[OutputInfo]) -> usize { 2 }
    fn out_pins(&self, _: &[OutputInfo]) -> usize { 1 }
}

/* -------------------------
   Relationen (⊆, ⊇, ∈, =)
--------------------------*/

pub struct RelationsOperatorNode {
    op: RelOp,
    latex: LatexNode,
    inputs_cache: Vec<Option<OutputInfo>>,
}

impl RelationsOperatorNode {
    pub fn new(op: RelOp) -> Self {
        Self {
            op,
            latex: LatexNode::new(format!("Rel:{op:?}"), Box::new(RelProvider { op })),
            inputs_cache: vec![],
        }
    }
}

/*impl Knoten for RelationsOperatorNode {
    fn name(&self) -> &str {
        match self.op {
            RelOp::Teilmenge => "Teilmenge (⊆)",
            RelOp::Obermenge => "Obermenge (⊇)",
            RelOp::ElementVon => "Element (∈)",
            RelOp::Gleichheit => "Gleichheit (=)",
        }
    }

    fn inputs(&self) -> usize { 2 }
    fn outputs(&self) -> usize { 1 }

    fn input_type(&self, i: usize) -> PinType {
        match self.op {
            RelOp::Teilmenge | RelOp::Obermenge => PinType::Menge,
            RelOp::ElementVon => if i == 0 { PinType::Element } else { PinType::Menge },
            RelOp::Gleichheit => PinType::Element,
        }
    }

    fn output_type(&self, _o: usize) -> PinType {
        // Du wolltest später ggf. Abbild(Args->Logik). Für jetzt: Logik, CAS kommt später.
        PinType::Logik
    }

    fn on_inputs_changed(&mut self, inputs: Vec<Option<OutputInfo>>) {
        self.inputs_cache = inputs;
        let present = self.inputs_cache.iter().filter_map(|x| Some(x.clone())).collect::<Vec<_>>();
        self.latex.on_inputs_changed(present);
    }

    fn output_info(&self, _o: usize) -> OutputInfo {
        OutputInfo { latex: r"\LaTeX".to_string() /*self.latex.current_body_latex()*/, ty: PinType::Logik, set_id: None }
    }

    fn show_input(&mut self, pin: &InPin, ui: &mut Ui) { self.latex.show_input(pin, ui); }
    fn show_output(&mut self, pin: &OutPin, ui: &mut Ui) { self.latex.show_output(pin, ui); }
    fn show_body(&mut self, node: NodeId, inputs: &[InPin],outputs: &[OutPin],ui: &mut Ui,) {
        
    }
    fn show_header(&mut self, node: NodeId, inputs: &[InPin], outputs: &[OutPin],ui: &mut Ui) {
        
    }
    fn show_footer(&mut self, node: NodeId, inputs: &[InPin], outputs: &[OutPin],ui: &mut Ui) {
        
    }
    fn as_any(&mut self) -> &mut dyn Any { self }
}

struct RelProvider { op: RelOp }
impl LatexSourceProvider for RelProvider {
    fn title(&self, _: &[OutputInfo]) -> Option<String> {
        match self.op {
            RelOp::Teilmenge => Some(r"\textbf{Teilmenge}".into()),
            RelOp::Obermenge => Some(r"\textbf{Obermenge}".into()),
            RelOp::ElementVon => Some(r"\textbf{Element}".into()),
            RelOp::Gleichheit => Some(r"\textbf{Gleichheit}".into()),
        }
    }

    fn body(&self, inputs: &[OutputInfo]) -> Option<String> {
        let a = inputs.get(0).map(|i| i.latex.as_str()).unwrap_or("x");
        let b = inputs.get(1).map(|i| i.latex.as_str()).unwrap_or("A");
        match self.op {
            RelOp::Teilmenge => Some(format!(r"$\left({a}\right)\subseteq\left({b}\right)$")),
            RelOp::Obermenge => Some(format!(r"$\left({a}\right)\supseteq\left({b}\right)$")),
            RelOp::ElementVon => Some(format!(r"$\left({a}\right)\in\left({b}\right)$")),
            RelOp::Gleichheit => Some(format!(r"$\left({a}\right)=\left({b}\right)$")),
        }
    }

    fn footer(&self, _: &[OutputInfo]) -> Option<String> { Some(String::new()) }

    fn in_pin_label(&self, idx: usize, _: &[OutputInfo]) -> Option<String> {
        match self.op {
            RelOp::ElementVon => if idx == 0 { Some(r"$x$".into()) } else { Some(r"$A$".into()) },
            _ => if idx == 0 { Some(r"$A$".into()) } else { Some(r"$B$".into()) },
        }
    }

    fn out_pin_label(&self, _: usize, _: &[OutputInfo]) -> Option<String> { Some(r"$\mathrm{out}$".into()) }
    fn in_pins(&self, _: &[OutputInfo]) -> usize { 2 }
    fn out_pins(&self, _: &[OutputInfo]) -> usize { 1 }
}*/
