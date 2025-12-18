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
    
    pub title: LaTeXQuelle,
    pub body: LaTeXQuelle,
    pub footer: LaTeXQuelle,

    pub in_pin_sections: Vec<LaTeXQuelle>,
    pub out_pin_sections: Vec<LaTeXQuelle>,
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
        };
        ausgabe.on_inputs_changed(Vec::new());
        return ausgabe
    }

    pub fn name(&self) -> &str { return &self.name }
}

impl KnotenInhalt for LatexNode {
    fn show_input(&mut self, pin: &InPin, ui: &mut Ui) { zeige_anschluss(&mut self.in_pin_sections, AnyPin::In(pin), ui) }
    fn show_output(&mut self, pin: &OutPin, ui: &mut Ui) { zeige_anschluss(&mut self.out_pin_sections, AnyPin::Out(pin), ui) }
    fn show_header(&mut self, node: NodeId, inputs: &[InPin], outputs: &[OutPin],ui: &mut Ui) { self.title.show(ui) }
    fn show_body(&mut self, node: NodeId, inputs: &[InPin],outputs: &[OutPin],ui: &mut Ui,) { self.body.show(ui) }
    fn show_footer(&mut self, node: NodeId, inputs: &[InPin], outputs: &[OutPin],ui: &mut Ui) { self.footer.show(ui) }
}

impl KnotenDaten for LatexNode {
    fn output_info(&self, output: usize) -> OutputInfo {
        return OutputInfo::new("",PinType::Element);
    }
    fn on_inputs_changed(&mut self, inputs: Vec<Option<OutputInfo>>) {
        let present: Vec<OutputInfo> = inputs.into_iter().flatten().collect();

        self.title.set_src_opt(self.provider.title(&present));
        self.body.set_src_opt(self.provider.body(&present));
        self.footer.set_src_opt(self.provider.footer(&present));

        for (pin_index, pin) in self.in_pin_sections.iter_mut().enumerate() {
            pin.set_src_opt(self.provider.in_pin_label(pin_index, &present));
        }
        for (pin_index, pin) in self.out_pin_sections.iter_mut().enumerate() {
            pin.set_src_opt(self.provider.out_pin_label(pin_index, &present));
        }
    }
}

fn zeige_anschluss(
    pin_sektionen: &mut Vec<LaTeXQuelle>,
    pin: AnyPin<'_>,
    ui: &mut Ui
) {
    if let Some(quelle) = erhalte_sektion(pin_sektionen, pin) { quelle.show(ui) } else { ui.label("..."); }
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
