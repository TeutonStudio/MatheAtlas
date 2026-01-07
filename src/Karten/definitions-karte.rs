// Pfad: ../src/Karten/definitions-karte.rs

use eframe::egui::Ui;
use egui_snarl::{
    InPin, OutPin, NodeId, Snarl,
    ui::{SnarlViewer, SnarlStyle, SnarlWidget, SnarlPin, PinInfo, PinPlacement::Edge},
};

use crate::{basis_knoten::Knoten, typen};

fn pin_style_for(ty: &typen::PinType) -> PinInfo {
    // Minimal, aber brauchbar. Wenn du willst, kopier deine echte Mapping-Logik hier rein.
    match ty {
        typen::PinType::Element => PinInfo::circle(),
        typen::PinType::Menge { elem, set } => PinInfo::square(),
        typen::PinType::Zahl { .. } => PinInfo::triangle(),
        typen::PinType::Logik => PinInfo::star(),
        _ => PinInfo::circle(),
    }
}

pub struct DefinitionsKarte;

impl SnarlViewer<Box<dyn Knoten>> for DefinitionsKarte {
    // fn connect(&mut self,_from: &OutPin,_to: &InPin,_snarl: &mut Snarl<Box<dyn Knoten>>) {}
    // fn disconnect(&mut self,_from: &OutPin,_to: &InPin,_snarl: &mut Snarl<Box<dyn Knoten>>) {}

    #[allow(refining_impl_trait)]
    fn show_input(
        &mut self,
        pin: &InPin,
        ui: &mut Ui,
        snarl: &mut Snarl<Box<dyn Knoten>>,
    ) -> impl SnarlPin + 'static {
        let node = &mut snarl[pin.id.node];
        node.show_input(pin, ui);
        pin_style_for(&node.input_type(pin.id.input))
    }

    #[allow(refining_impl_trait)]
    fn show_output(
        &mut self,
        pin: &OutPin,
        ui: &mut Ui,
        snarl: &mut Snarl<Box<dyn Knoten>>,
    ) -> impl SnarlPin + 'static {
        let node = &mut snarl[pin.id.node];
        node.show_output(pin, ui);
        pin_style_for(&node.output_type(pin.id.output))
    }

    fn show_header(
        &mut self,
        node_id: NodeId,
        inputs: &[InPin],
        outputs: &[OutPin],
        ui: &mut Ui,
        snarl: &mut Snarl<Box<dyn Knoten>>,
    ) {
        snarl[node_id].show_header(node_id, inputs, outputs, ui);
    }

    fn show_body(
        &mut self,
        node_id: NodeId,
        inputs: &[InPin],
        outputs: &[OutPin],
        ui: &mut Ui,
        snarl: &mut Snarl<Box<dyn Knoten>>,
    ) {
        snarl[node_id].show_body(node_id, inputs, outputs, ui);
    }

    fn show_footer(
        &mut self,
        node_id: NodeId,
        inputs: &[InPin],
        outputs: &[OutPin],
        ui: &mut Ui,
        snarl: &mut Snarl<Box<dyn Knoten>>,
    ) {
        snarl[node_id].show_footer(node_id, inputs, outputs, ui);
    }

    fn title(&mut self, node: &Box<dyn Knoten>) -> String { node.name().to_string() }
    fn inputs(&mut self, node: &Box<dyn Knoten>) -> usize { node.inputs() }
    fn outputs(&mut self, node: &Box<dyn Knoten>) -> usize { node.outputs() }
}

pub fn show_definitions_karte(
    karte: &mut Snarl<Box<dyn Knoten>>,
    ui: &mut Ui,
) {
    let mut style = SnarlStyle::new();
    style.pin_placement = Some(Edge);
    SnarlWidget::new()
        //.id(Id::new("demo-snarl"))
        .style(style)
        .show( karte, &mut DefinitionsKarte, ui);
}
