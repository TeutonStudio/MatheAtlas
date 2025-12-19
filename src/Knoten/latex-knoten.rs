// Pfad: ../src/Knoten/latex-knoten.rs

use eframe::egui::Ui;
use egui_snarl::{InPin, OutPin, NodeId};

use crate::LaTeX::interpreter::{LaTeXQuelle,LaTeXQuellBereitsteller};

use crate::typen::{OutputInfo,PinType};
use crate::basis_knoten::{KnotenDaten, KnotenInhalt};


/// Trait: Die Anwendung liefert hiermit LaTeX-Strings basierend auf Inputs.
/// (Du wolltest: App generiert Strings, Node rendert nur.)

/// Ein Bereich (Title/Body/Footer/Pinlabel) als gerenderte Grafik mit Cache.



/// LatexNode: rendert Title/Body/Footer + Pin-Labels als LaTeX → SVG → Texture.
pub struct LatexNode {
    name: String,

    pub provider: Box<dyn LaTeXQuellBereitsteller>,
    
    title: LaTeXQuelle,
    body: LaTeXQuelle,
    footer: LaTeXQuelle,

    in_pin_sections: Vec<LaTeXQuelle>,
    out_pin_sections: Vec<LaTeXQuelle>,

    inputs_cache: Vec<Option<OutputInfo>>,
}

impl LatexNode {
    pub fn new(name: impl Into<String>, provider: Box<dyn LaTeXQuellBereitsteller>) -> Self {
        let mut ausgabe = Self {
            name: name.into(), provider,
            title: LaTeXQuelle::new(),
            body: LaTeXQuelle::new(),
            footer: LaTeXQuelle::new(),
            in_pin_sections: vec![LaTeXQuelle::new()],
            out_pin_sections: vec![LaTeXQuelle::new()],
            inputs_cache: vec![],
        };
        let empty: [Option<OutputInfo>; 0] = [];
        ausgabe.aktualisiere_titel(&empty);
        ausgabe.aktualisiere_body(&empty);
        ausgabe.aktualisiere_footer(&empty);
        return ausgabe
    }

    pub fn name(&self) -> &str { return &self.name }

    pub fn titel_klickbar_machen(&mut self, klickbar: bool) {
        self.title.klickbar = klickbar;
    }
    fn aktualisiere_titel(&mut self, inputs: &[Option<OutputInfo>]) {
        let present: Vec<&OutputInfo> = inputs.into_iter().flatten().collect();
        self.title.set_src_opt(self.provider.title(&present));
    }

    pub fn body_klickbar_machen(&mut self, klickbar: bool) {
        self.body.klickbar = klickbar;
    }
    fn aktualisiere_body(&mut self, inputs: &[Option<OutputInfo>]) {
        let present: Vec<&OutputInfo> = inputs.into_iter().flatten().collect();
        self.body.set_src_opt(self.provider.body(&present));
    }

    pub fn footer_klickbar_machen(&mut self, klickbar: bool) {
        self.footer.klickbar = klickbar;
    }
    fn aktualisiere_footer(&mut self, inputs: &[Option<OutputInfo>]) {
        let present: Vec<&OutputInfo> = inputs.into_iter().flatten().collect();
        self.footer.set_src_opt(self.provider.footer(&present));
    }

    fn aktualisiere_eingang(&mut self, pin_index: usize, inputs: &[Option<OutputInfo>]) {
        let present: Vec<&OutputInfo> = inputs.into_iter().flatten().collect();
        if let Some(pin) = self.in_pin_sections.get_mut(pin_index) {
            pin.set_src_opt(self.provider.in_pin_label(pin_index, &present));
        }
    }

    fn aktualisiere_ausgang(&mut self, pin_index: usize, outputs: &[Option<OutputInfo>]) {
        let present: Vec<&OutputInfo> = outputs.into_iter().flatten().collect();
        if let Some(pin) = self.out_pin_sections.get_mut(pin_index) {
            pin.set_src_opt(self.provider.out_pin_label(pin_index, &present));
        }
    }
}

impl KnotenInhalt for LatexNode {
    fn show_input(&mut self, pin: &InPin, ui: &mut Ui) { zeige_anschluss(&mut self.in_pin_sections, AnyPin::In(pin), ui) }
    fn show_output(&mut self, pin: &OutPin, ui: &mut Ui) { zeige_anschluss(&mut self.out_pin_sections, AnyPin::Out(pin), ui) }
    fn show_header(&mut self, node: NodeId, inputs: &[InPin], outputs: &[OutPin],ui: &mut Ui) -> bool { return self.title.show(ui) }
    fn show_body(&mut self, node: NodeId, inputs: &[InPin],outputs: &[OutPin],ui: &mut Ui,) -> bool { return self.body.show(ui) }
    fn show_footer(&mut self, node: NodeId, inputs: &[InPin], outputs: &[OutPin],ui: &mut Ui) -> bool { return self.footer.show(ui) }
}

impl KnotenDaten for LatexNode {
    fn output_info(&self, output: usize) -> OutputInfo {
        return OutputInfo::new("",PinType::Element);
    }
    fn on_inputs_changed(&mut self, inputs: Vec<Option<OutputInfo>>) {
        // let present: Vec<OutputInfo> = inputs.into_iter().flatten().collect();

        self.aktualisiere_titel(&inputs);
        self.aktualisiere_body(&inputs);
        self.aktualisiere_footer(&inputs);
        for i in 0..self.in_pin_sections.len() {
            if self.inputs_cache[i] != inputs[i] {
                self.inputs_cache[i] = inputs[i].clone();
                self.aktualisiere_eingang(i, &inputs);
            }
        }
        for o in 0..self.out_pin_sections.len() {
            self.aktualisiere_ausgang(o, &inputs);
        }
    }
}

fn zeige_anschluss(
    pin_sektionen: &mut Vec<LaTeXQuelle>,
    pin: AnyPin<'_>,
    ui: &mut Ui
) {
    if let Some(quelle) = erhalte_sektion(pin_sektionen, pin) { quelle.show(ui); } else { ui.label("..."); }
}

enum AnyPin<'a> {
    In(&'a InPin),
    Out(&'a OutPin),
}

fn erhalte_sektion<'a>(
    pin_sektionen: &'a mut Vec<LaTeXQuelle>,
    pin: AnyPin<'_>,
) -> Option<&'a mut LaTeXQuelle> {
    let index = match pin {
        AnyPin::In(pin) => pin.id.input,
        AnyPin::Out(pin) => pin.id.output,
    };
    return pin_sektionen.get_mut(index)
}
