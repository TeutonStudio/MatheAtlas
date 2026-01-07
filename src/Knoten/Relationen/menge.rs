// Pfad: src/Knoten/Relationen/menge.rs

use std::{any::Any, rc::Rc};

use eframe::egui::{Ui,Window,pos2};
use egui_snarl::{NodeId, InPin, OutPin, Snarl};

use crate::basis_karte::karte_kontext::logik_definition::WahrNode;
use crate::typen::{OutputInfo, PinType};

use crate::LaTeX::interpreter::{LaTeXQuelle,LaTeXQuellBereitsteller};
use crate::basis_knoten::{KnotenStruktur,KnotenInhalt,KnotenDaten,Knoten};
use crate::latex_knoten::{LatexNode};
use crate::operator_knoten::{OperatorNode};


#[derive(Clone, Copy, Debug)]
pub enum RelOp {
    Teilmenge,   // ⊆
    Obermenge,   // ⊇
    ElementVon,  // ∈
    Gleichheit,  // =
}

/* -------------------------
   Relationen (⊆, ⊇, ∈, =)
--------------------------*/

pub struct MengenRelationNode {
    op: RelOp,
    latex: LatexNode,
    inputs_cache: Vec<Option<OutputInfo>>,
}

impl MengenRelationNode {
    pub fn new(op: RelOp) -> Self {
        Self {
            op,
            latex: LatexNode::new(format!("Rel:{op:?}"), Rc::new(RelProvider { op })),
            inputs_cache: vec![],
        }
    }
}

impl KnotenInhalt for MengenRelationNode {
    fn show_input(&mut self, pin: &InPin, ui: &mut Ui) { self.latex.show_input(pin, ui); }
    fn show_output(&mut self, pin: &OutPin, ui: &mut Ui) { self.latex.show_output(pin, ui); }
    fn show_body(&mut self, node: NodeId, inputs: &[InPin],outputs: &[OutPin],ui: &mut Ui,) -> bool {
        return self.latex.show_body(node, inputs, outputs, ui);
    }
    fn show_header(&mut self, node: NodeId, inputs: &[InPin], outputs: &[OutPin],ui: &mut Ui) -> bool {
        return self.latex.show_header(node, inputs, outputs, ui);
    }
    fn show_footer(&mut self, node: NodeId, inputs: &[InPin], outputs: &[OutPin],ui: &mut Ui) -> bool {
        return self.latex.show_footer(node, inputs, outputs, ui);
    }
}
impl KnotenDaten for MengenRelationNode {
    fn output_info(&self, _o: usize) -> OutputInfo {
        return OutputInfo { latex: r"\LaTeX".to_string() /*self.latex.current_body_latex()*/, ty: PinType::Logik, value: None, set: None, set_id: None }
    }

    fn on_inputs_changed(&mut self, inputs: Vec<Option<OutputInfo>>) {
        self.inputs_cache = inputs;
        let present = self.inputs_cache.iter().filter_map(|x| Some(x.clone())).collect::<Vec<_>>();
        self.latex.on_inputs_changed(present);
    }
}
impl KnotenStruktur for MengenRelationNode {
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
            RelOp::Teilmenge | RelOp::Obermenge => PinType::Menge { elem: Box::new(PinType::Element), set: None },
            RelOp::ElementVon => if i == 0 { PinType::Element } else { PinType::Menge { elem: Box::new(PinType::Element), set: None } },
            RelOp::Gleichheit => PinType::Element,
        }
    }

    fn output_type(&self, _o: usize) -> PinType {
        // Du wolltest später ggf. Abbild(Args->Logik). Für jetzt: Logik, CAS kommt später.
        PinType::Logik
    }
}
impl Knoten for MengenRelationNode {
    fn as_any(&mut self) -> &mut dyn Any { self }
}

struct RelProvider { op: RelOp }
impl LaTeXQuellBereitsteller for RelProvider {
    fn title(&self, inputs: &[&OutputInfo]) -> Option<String> {
        match self.op {
            RelOp::Teilmenge => Some(r"\textbf{Teilmenge}".into()),
            RelOp::Obermenge => Some(r"\textbf{Obermenge}".into()),
            RelOp::ElementVon => Some(r"\textbf{Element}".into()),
            RelOp::Gleichheit => Some(r"\textbf{Gleichheit}".into()),
        }
    }

    fn body(&self, inputs: &[&OutputInfo]) -> Option<String> {
        let a = inputs.get(0).map(|i| i.latex.as_str()).unwrap_or("x");
        let b = inputs.get(1).map(|i| i.latex.as_str()).unwrap_or("A");
        match self.op {
            RelOp::Teilmenge => Some(format!(r"$\left({a}\right)\subseteq\left({b}\right)$")),
            RelOp::Obermenge => Some(format!(r"$\left({a}\right)\supseteq\left({b}\right)$")),
            RelOp::ElementVon => Some(format!(r"$\left({a}\right)\in\left({b}\right)$")),
            RelOp::Gleichheit => Some(format!(r"$\left({a}\right)=\left({b}\right)$")),
        }
    }

    fn footer(&self, inputs: &[&OutputInfo]) -> Option<String> { Some(String::new()) }

    fn in_pin_label(&self, idx: usize, _: &[&OutputInfo]) -> Option<String> {
        match self.op {
            RelOp::ElementVon => if idx == 0 { Some(r"$x$".into()) } else { Some(r"$A$".into()) },
            _ => if idx == 0 { Some(r"$A$".into()) } else { Some(r"$B$".into()) },
        }
    }

    fn out_pin_label(&self, _: usize, _: &[&OutputInfo]) -> Option<String> { Some(r"$\mathrm{out}$".into()) }
    fn in_pins(&self) -> usize { 2 }
    fn out_pins(&self) -> usize { 1 }
}
