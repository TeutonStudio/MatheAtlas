// Pfad: ../src/Operatoren/menge.rs

use std::any::Any;

use eframe::egui::{Ui,Window,pos2};
use egui_snarl::{NodeId, InPin, OutPin, Snarl};

use crate::basis_karte::karte_kontext::logik_definition::WahrNode;
use crate::typen::{OutputInfo, PinType};

use crate::LaTeX::interpreter::{LaTeXQuelle,LaTeXQuellBereitsteller};
use crate::basis_knoten::{KnotenStruktur,KnotenInhalt,KnotenDaten,Knoten};
use crate::latex_knoten::{LatexNode};
use crate::operator_knoten::{OperatorNode};

#[derive(Clone, Copy, Debug)]
pub enum MengenOp {
    Vereinigung,
    Schnitt,
    Differenz,
    Potenz,
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
impl LaTeXQuellBereitsteller for SingletonProvider {
    fn title(&self, _inputs: &[&OutputInfo]) -> Option<String> { Some(r"\textbf{Singleton}".into()) }
    fn body(&self, inputs: &[&OutputInfo]) -> Option<String> {
        let x = inputs.get(0).map(|i| i.latex.as_str()).unwrap_or("x");
        Some(format!(r"$\{{{x}\}}$"))
    }
    fn footer(&self, _inputs: &[&OutputInfo]) -> Option<String> { Some(String::new()) }
    fn in_pin_label(&self, _: usize, _: &[&OutputInfo]) -> Option<String> { Some(r"$x$".into()) }
    fn out_pin_label(&self, _: usize, _: &[&OutputInfo]) -> Option<String> { Some(r"$\{x\}$".into()) }
    fn in_pins(&self) -> usize { 1 }
    fn out_pins(&self) -> usize { 1 }
}

/* -------------------------
   Mengenoperatoren
--------------------------*/

pub struct MengenOperatorNode {
    op: OperatorNode,
    //latex: LatexNode,
    //inputs_cache: Vec<Option<OutputInfo>>,
    //show_def: bool,
    //def_snarl: egui_snarl::Snarl<Box<dyn Knoten>>,
    //def_viewer: DefinitionsKarte,
}

impl MengenOperatorNode {
    pub fn new(op: MengenOp) -> Self {
        let provider = Box::new(MengenProvider { op });
        let snarl = provider.definitions_snarl();
        Self { // TODO herausfinden, wieso nach erzeugung nur ... überall steht (temporär repariert, durch on_inputs_changed im LatexNode impl)
            op: OperatorNode::new(
                format!("Mengen:{op:?}"), 
                provider, snarl,
            ),
            // inputs_cache: vec![],
        }
    }
}

impl KnotenInhalt for MengenOperatorNode {
    fn show_input(&mut self, pin: &InPin, ui: &mut Ui) { self.op.show_input(pin, ui); }
    fn show_output(&mut self, pin: &OutPin, ui: &mut Ui) { self.op.show_output(pin, ui); }
    fn show_body(&mut self, node: NodeId, inputs: &[InPin],outputs: &[OutPin],ui: &mut Ui,) -> bool {
        return self.op.show_body(node, inputs, outputs, ui)
    }
    fn show_header(&mut self, node: NodeId, inputs: &[InPin], outputs: &[OutPin],ui: &mut Ui) -> bool {
        return self.op.show_header(node, inputs, outputs, ui)
    }
    fn show_footer(&mut self, node: NodeId, inputs: &[InPin], outputs: &[OutPin],ui: &mut Ui) -> bool {
        return self.op.show_footer(node, inputs, outputs, ui)
    }
}
impl KnotenDaten for MengenOperatorNode {
    fn on_inputs_changed(&mut self, inputs: Vec<Option<OutputInfo>>) { self.op.latex.on_inputs_changed(inputs) }
    fn output_info(&self, _o: usize) -> OutputInfo {
        OutputInfo { latex: r"\LaTeX".to_string() /*self.latex.current_body_latex()*/, ty: PinType::Menge, set_id: None }
    }
    fn take_dirty(&mut self) -> bool {
        false
    }
}
impl KnotenStruktur for MengenOperatorNode {
    fn name(&self) -> &str { &self.op.name() }
    fn inputs(&self) -> usize { self.op.latex.provider.in_pins() }
    fn outputs(&self) -> usize { self.op.latex.provider.out_pins() }

    fn input_type(&self, _i: usize) -> PinType { PinType::Menge }
    fn output_type(&self, _o: usize) -> PinType { PinType::Menge }
}

impl Knoten for MengenOperatorNode {
    fn as_any(&mut self) -> &mut dyn Any { self }
}

struct MengenProvider { op: MengenOp }
impl MengenProvider {
    fn definitions_snarl(&self) -> Snarl<Box<dyn Knoten>> {
        let mut snarl: Snarl<Box<dyn Knoten>> = Snarl::new();
        // TODO fülle snarl mit definitionsknoten, abhängig von self.op und evtl. verbundenen knoten
        match self.op {
            MengenOp::Vereinigung => {
                snarl.insert_node(pos2(0.0,0.0), Box::new(WahrNode::new(true, false)));
            },
            MengenOp::Schnitt => {

            },
            MengenOp::Differenz => {

            },
            MengenOp::Potenz => {

            },
        }
        snarl
    }
}
impl LaTeXQuellBereitsteller for MengenProvider {
    fn title(&self, _: &[&OutputInfo]) -> Option<String> {
        match self.op {
            MengenOp::Vereinigung => Some(r"\textbf{Vereinigungsmenge}".into()),
            MengenOp::Schnitt => Some(r"\textbf{Schnittmenge}".into()),
            MengenOp::Differenz => Some(r"\textbf{Differenzmenge}".into()),
            MengenOp::Potenz => Some(r"\textbf{Potenzmenge}".into()),
        }
    }

    fn body(&self, inputs: &[&OutputInfo]) -> Option<String> {
        let a = inputs.get(0).map(|i| i.latex.as_str()).unwrap_or("A");
        let b = inputs.get(1).map(|i| i.latex.as_str()).unwrap_or("B");
        match self.op {
            MengenOp::Vereinigung => Some(format!(r"\left({a}\right)\cup\left({b}\right)")),
            MengenOp::Schnitt => Some(format!(r"\left({a}\right)\cap\left({b}\right)")),
            MengenOp::Differenz => Some(format!(r"\left({a}\right)\setminus\left({b}\right)")),
            MengenOp::Potenz => Some(format!(r""))
        }
    }

    fn footer(&self, _: &[&OutputInfo]) -> Option<String> { None }

    fn in_pin_label(&self, idx: usize, _: &[&OutputInfo]) -> Option<String> {
        if idx == 0 { Some(r"A".into()) } else { Some(r"B".into()) }
    }
    fn out_pin_label(&self, _: usize, _: &[&OutputInfo]) -> Option<String> { None }
    
    fn in_pins(&self) -> usize { 2 } // TODO abhängig von Operator und verbundenen anzahl und kompatibler verbindungsstart
    fn out_pins(&self) -> usize { 1 }
}
