// Pfad: ../src/Operatoren/logik.rs

use std::any::Any;

use eframe::egui::Ui;
use egui_snarl::{InPin, OutPin};

use crate::typen::{OutputInfo, PinType, SetId};

use crate::LaTeX::{
    interpreter::{LaTeXQuelle,LaTeXQuellBereitsteller},
    logik,
};
use crate::basis_knoten::{KnotenStruktur,KnotenInhalt,KnotenDaten,Knoten};
use crate::latex_knoten::{LatexNode};

#[derive(Clone, Copy, Debug)]
pub enum LogikOp {
    Negation,
    Konjunktion,
    Disjunktion,
    Implikation,
    Äquivalenzrelation,
}

pub struct LogikOperatorNode {
    op: LogikOp,
    latex: LatexNode,
    // Inputs vom Graph (propagiert)
    inputs_cache: Vec<Option<OutputInfo>>,
    // Output-Typ dynamisch: Logik oder Abbild(E->Logik)
    out_ty: PinType,
}

impl LogikOperatorNode {
    pub fn new(op: LogikOp) -> Self {
        let provider = Box::new(LogikProvider { op });
        Self {
            op,
            latex: LatexNode::new(format!("Logik:{op:?}"), provider),
            inputs_cache: vec![],
            out_ty: PinType::Logik,
        }
    }

    fn recompute_types(&mut self) {
        // Regel:
        // - Logik op Logik -> Logik
        // - Abbild(E->Logik) op Abbild(E->Logik) -> Abbild(E->Logik)
        // - Negation: gleiches Prinzip
        //
        // Wir nehmen hier "Element-Domäne" als SetId::ElementAll (oder was du nutzt).
        // Für Abbild brauchen wir konkrete Sets. Wenn Inputs Abbild sind:
        // - wir nehmen (konservativ) den "kleineren" Wertevorrat, "kleinere" Zielmenge? (für Logik-Zielmenge egal)
        // Minimal: wenn mindestens ein Input Abbild ist -> Output Abbild, sonst Logik.

        let mut any_map = None::<(SetId, SetId)>;
        for info in self.inputs_cache.iter().flatten() {
            if let PinType::Abbild { wertevorrat, zielmenge } = &info.ty {
                any_map = Some((wertevorrat.clone(), zielmenge.clone()));
                break;
            }
        }

        self.out_ty = if let Some((w, z)) = any_map {
            PinType::Abbild { wertevorrat: w, zielmenge: z }
        } else {
            PinType::Logik
        };
    }
}

impl KnotenDaten for LogikOperatorNode {
    fn on_inputs_changed(&mut self, inputs: Vec<Option<OutputInfo>>) {
        self.inputs_cache = inputs;
        self.recompute_types();

        // LatexNode erwartet "Inputs" ohne Option? In deinem LatexNode-Entwurf waren Vec<OutputInfo>.
        // Wir geben nur verbundene rein, und Provider kann fehlende behandeln.
        let present = self.inputs_cache.iter().filter_map(|x| Some(x.clone())).collect::<Vec<_>>();
        // self.latex.on_inputs_changed(present);
    }

    fn output_info(&self, _output: usize) -> OutputInfo {
        OutputInfo {
            latex: r"\LaTeX".to_string(), // self.latex.current_body_latex(), // muss LatexNode liefern (oder du passt das an)
            ty: self.out_ty.clone(),
            set_id: None
        }
    }
    fn take_dirty(&mut self) -> bool {
        false
    }
}

impl KnotenStruktur for LogikOperatorNode {
    fn name(&self) -> &str {
        match self.op {
            LogikOp::Negation => "Negation (¬)",
            LogikOp::Konjunktion => "Konjunktion (∧)",
            LogikOp::Disjunktion => "Disjunktion (∨)",
            LogikOp::Implikation => "Implikation (→)",
            LogikOp::Äquivalenzrelation => "Äquivalenzrelation (↔)",
        }
    }

    fn inputs(&self) -> usize {
        match self.op {
            LogikOp::Negation => 1,
            _ => 2,
        }
    }

    fn outputs(&self) -> usize {
        1
    }

    fn input_type(&self, _input: usize) -> PinType {
        // Logik-Operatoren akzeptieren Logik ODER Abbild(E->Logik)
        // (der Graph blockt inkompatibel, also reicht hier "Element" NICHT)
        PinType::Logik // Graph darf zusätzlich Abbild erlauben (compat rule)
    }

    fn output_type(&self, _output: usize) -> PinType {
        self.out_ty.clone()
    }
}
impl KnotenInhalt for LogikOperatorNode {
    fn show_input(&mut self, pin: &InPin, ui: &mut Ui) {
        self.latex.show_input(pin, ui);
    }

    fn show_output(&mut self, pin: &OutPin, ui: &mut Ui) {
        self.latex.show_output(pin, ui);
    }

    fn show_body(&mut self, node: egui_snarl::NodeId, inputs: &[InPin],outputs: &[OutPin],ui: &mut Ui,) -> bool {
        return false
    }

    fn show_footer(&mut self, node: egui_snarl::NodeId, inputs: &[InPin], outputs: &[OutPin],ui: &mut Ui) -> bool {
        return false
    }

    fn show_header(&mut self, node: egui_snarl::NodeId, inputs: &[InPin], outputs: &[OutPin],ui: &mut Ui) -> bool {
        return false
    }
}
impl Knoten for LogikOperatorNode {
    fn as_any(&mut self) -> &mut dyn Any { self }
}

/* -------------------------
   Latex Provider
--------------------------*/

struct LogikProvider {
    op: LogikOp,
}

impl LaTeXQuellBereitsteller for LogikProvider {
    fn title(&self, _inputs: &[&OutputInfo]) -> Option<String> {
        match self.op {
            LogikOp::Negation => Some(r"\textbf{Negation}".into()),
            LogikOp::Konjunktion => Some(r"\textbf{Konjunktion}".into()),
            LogikOp::Disjunktion => Some(r"\textbf{Disjunktion}".into()),
            LogikOp::Implikation => Some(r"\textbf{Implikation}".into()),
            LogikOp::Äquivalenzrelation => Some(r"\textbf{Äquivalenzrelation}".into()),
        }
    }

    fn body(&self, inputs: &[&OutputInfo]) -> Option<String> {
        let a = inputs.get(0).map(|x| x.latex.as_str()).unwrap_or(r"\,\cdot\,");
        let b = inputs.get(1).map(|x| x.latex.as_str()).unwrap_or(r"\,\cdot\,");

        match self.op {
            LogikOp::Negation => Some(format!(r"$\neg\left({a}\right)$")),
            LogikOp::Konjunktion => Some(format!(r"$\left({a}\right)\land\left({b}\right)$")),
            LogikOp::Disjunktion => Some(format!(r"$\left({a}\right)\lor\left({b}\right)$")),
            LogikOp::Implikation => Some(format!(r"$\left({a}\right)\rightarrow\left({b}\right)$")),
            LogikOp::Äquivalenzrelation => Some(format!(r"$\left({a}\right)\leftrightarrow\left({b}\right)$")),
        }
    }

    fn footer(&self, _inputs: &[&OutputInfo]) -> Option<String> {
        Some(String::new())
    }

    fn in_pin_label(&self, pin_index: usize, _inputs: &[&OutputInfo]) -> Option<String> {
        match self.op {
            LogikOp::Negation => if pin_index == 0 { Some(r"$P$".into()) } else { Some(r"$?$".into()) },
            _ => if pin_index == 0 { Some(r"$P$".into()) } else { Some(r"$Q$".into()) },
        }
    }

    fn out_pin_label(&self, _pin_index: usize, _inputs: &[&OutputInfo]) -> Option<String> {
        Some(r"$\mathrm{out}$".into())
    }

    fn in_pins(&self) -> usize {
        match self.op {
            LogikOp::Negation => 1,
            _ => 2,
        }
    }

    fn out_pins(&self) -> usize {
        1
    }
}
