// Pfad: ../src/Karten/basis-karte.rs

use eframe::egui::{Id, Ui, Style, Rect, Color32, Stroke, Painter, Pos2,Vec2, pos2,vec2};
use egui_snarl::{
    InPin, NodeId, OutPin, Snarl, InPinId, OutPinId,
    ui::{SnarlViewer, SnarlWidget, SnarlStyle, SnarlPin, PinInfo, PinShape, BackgroundPattern, PinPlacement::Edge},
};

use std::collections::{BTreeSet, HashSet};
use crate::{basis_knoten::Knoten, typen};

#[path = "../Kontext/karte.rs"]
mod karte_kontext;

use karte_kontext::{zeige_karten_kontext};

pub struct DemoKarte {
    pub snarl: Snarl<Box<dyn Knoten>>,
}

impl DemoKarte {
    pub fn new() -> Self {
        Self {
            snarl: Snarl::new(),
        }
    }
}

/* -------------------------
   SnarlViewer
--------------------------*/

pub struct DemoViewer;

fn punkt_raster(
    viewport: &Rect,
    painter: &Painter,
    style: &Style,
    spacing: Vec2,
    radius: f32,
    farbe: Option<Color32>,
) {
    let min_x = (viewport.min.x / spacing.x).floor() as i32;
    let max_x = (viewport.max.x / spacing.x).ceil() as i32;
    let min_y = (viewport.min.y / spacing.y).floor() as i32;
    let max_y = (viewport.max.y / spacing.y).ceil() as i32;

    let mut dot_color = style.visuals.widgets.inactive.fg_stroke.color.gamma_multiply(0.25);
    match farbe {
        Some(farbe) => dot_color = farbe,
        None => (),
    }

    for iy in min_y..=max_y {
        let y = iy as f32 * spacing.y;
        for ix in min_x..=max_x {
            let x = ix as f32 * spacing.x;
            painter.circle_filled(pos2(x, y), radius, dot_color);
        }
    }
}

fn update_node_inputs(
    snarl: &mut Snarl<Box<dyn Knoten>>,
    node_id: NodeId,
) {
    // 1) Zielnode Pin-Anzahl abfragen (oder max aus Connections, je nach Design)
    let mut inputs: Vec<Option<typen::OutputInfo>> = vec![None; snarl[node_id].inputs()];

    // 2) Alle Verbindungen durchgehen und die, die in node_id reingehen, einsammeln
    for (from,to) in snarl.wires() {
        // wire: { from: OutPinId, to: InPinId }
        if to.node == node_id && to.input < inputs.len() {
            inputs[to.input] = Some(snarl[from.node].output_info(from.output));
        }
    }

    // 3) Node informieren
    snarl[node_id].on_inputs_changed(inputs);
}

fn pin_style_for(ty: &typen::PinType) -> PinInfo {
    match ty {
        typen::PinType::Element => PinInfo::circle(),
        typen::PinType::Menge => PinInfo::square(),
        typen::PinType::Zahl { .. } => PinInfo::triangle(),
        typen::PinType::Logik => PinInfo::star(),
        typen::PinType::Abbild { .. } => PinInfo::square()
            .with_stroke(Stroke::new(2.0, Color32::WHITE)),
        _ => PinInfo::square(), // Vektor/Matrix/Tensor (und was du als nächstes erfindest)
    }
}


fn propagate_dirty(snarl: &mut Snarl<Box<dyn Knoten>>) {
    // 1) welche nodes sind dirty?
    let mut dirty: HashSet<NodeId> = HashSet::new();
    for (id, node) in snarl.nodes_ids_mut() {
        if node.take_dirty() {
            dirty.insert(id);
        }
    }
    if dirty.is_empty() {
        return;
    }

    // 2) welche nodes hängen downstream an dirty-outputs?
    let mut affected: BTreeSet<NodeId> = BTreeSet::new();
    for (from, to) in snarl.wires() {
        if dirty.contains(&from.node) {
            affected.insert(to.node);
        }
    }

    // 3) Inputs bei den betroffenen Nodes neu einsammeln
    for node_id in affected {
        update_node_inputs(snarl, node_id);
    }
}


impl SnarlViewer<Box<dyn Knoten>> for DemoViewer {
    fn draw_background(
        &mut self,
        _background: Option<&BackgroundPattern>,
        viewport: &Rect,
        _snarl_style: &SnarlStyle,
        style: &Style,
        painter: &Painter,
        _snarl: &Snarl<Box<dyn Knoten>>,
    ) { punkt_raster(viewport, painter, style, vec2(24.0,24.0), 1.2, None) }
    
    fn title(&mut self, node: &Box<dyn Knoten>) -> String { node.name().to_string() }
    fn inputs(&mut self, node: &Box<dyn Knoten>) -> usize { node.inputs() }
    fn outputs(&mut self, node: &Box<dyn Knoten>) -> usize { node.outputs() }

    #[allow(refining_impl_trait)]
    fn show_input(
        &mut self,
        pin: &InPin,
        ui: &mut Ui,
        snarl: &mut Snarl<Box<dyn Knoten>>,
    ) -> impl SnarlPin + 'static {
        snarl[pin.id.node].show_input(pin, ui);
        pin_style_for(&snarl[pin.id.node].input_type(pin.id.input))
    }

    #[allow(refining_impl_trait)]
    fn show_output(
        &mut self,
        pin: &OutPin,
        ui: &mut Ui,
        snarl: &mut Snarl<Box<dyn Knoten>>,
    ) -> impl SnarlPin + 'static {
        snarl[pin.id.node].show_output(pin, ui);
        pin_style_for(&snarl[pin.id.node].output_type(pin.id.output))
    }

    fn show_header(
        &mut self,
        node: NodeId,
        inputs: &[InPin],
        outputs: &[OutPin],
        ui: &mut Ui,
        snarl: &mut Snarl<Box<dyn Knoten>>,
    ) { snarl[node].show_header(node, inputs, outputs, ui) }
    fn has_body(&mut self, _node: &Box<dyn Knoten>) -> bool { return true }
    fn show_body(
        &mut self,
        node: NodeId,
        inputs: &[InPin],
        outputs: &[OutPin],
        ui: &mut Ui,
        snarl: &mut Snarl<Box<dyn Knoten>>,
    ) { snarl[node].show_body(node, inputs, outputs, ui) }
    fn has_footer(&mut self, node: &Box<dyn Knoten>) -> bool { return true }
    fn show_footer(
        &mut self,
        node: NodeId,
        inputs: &[InPin],
        outputs: &[OutPin],
        ui: &mut Ui,
        snarl: &mut Snarl<Box<dyn Knoten>>,
    ) { snarl[node].show_footer(node, inputs, outputs, ui) }


    fn has_graph_menu(&mut self, _: Pos2, _: &mut Snarl<Box<dyn Knoten>>) -> bool { return true }
    fn show_graph_menu(
        &mut self,
        pos: Pos2,
        ui: &mut Ui,
        snarl: &mut Snarl<Box<dyn Knoten>>,
    ) { zeige_karten_kontext(pos,ui,snarl) }

    fn has_node_menu(&mut self, _: &Box<dyn Knoten>) -> bool { return true }
    fn show_node_menu(
        &mut self,
        node: NodeId,
        _: &[InPin],
        _: &[OutPin],
        ui: &mut Ui,
        snarl: &mut Snarl<Box<dyn Knoten>>,
    ) {
        if ui.button("Duplizieren").clicked() { //TODO
            //snarl.remove_node(node);
            ui.close();
        }
        if ui.button("Entsorgen").clicked() {
            snarl.remove_node(node);
            ui.close();
        }
    }

    fn connect(&mut self, from: &OutPin, to: &InPin, snarl: &mut Snarl<Box<dyn Knoten>>) {
        let node_id = to.id.node;

        let ok = {
            let from_id = from.id.node;
            let selbst = node_id == from_id;
            let out_ty = snarl[from_id].output_type(from.id.output);
            let in_ty  = snarl[node_id].input_type(to.id.input);
            typen::compatible(&out_ty, &in_ty) && !selbst
        }; if !ok { return }
        
        let mut remove: Vec<(OutPinId, InPinId)> = Vec::new();
        for (von,nach) in snarl.wires() {
            if to.id == nach && from.id != von { remove.push((von, nach)) }
        }
        for (von, nach) in remove {
            snarl.disconnect(von, nach);
        }

        snarl.connect(from.id, to.id);
        update_node_inputs(snarl, node_id);
    }

    fn disconnect(&mut self, from: &OutPin, to: &InPin, snarl: &mut Snarl<Box<dyn Knoten>>) {
        let node_id = to.id.node;
        snarl.disconnect(from.id,to.id);
        update_node_inputs(snarl, node_id);
    }
}

/* -------------------------
   Widget-Helfer
--------------------------*/

pub fn show_demo_karte(
    karte: &mut DemoKarte,
    ui: &mut Ui,
) {
    let mut style = SnarlStyle::new();
    style.pin_placement = Some(Edge);
    SnarlWidget::new()
        .id(Id::new("demo-snarl"))
        .style(style)
        .show(&mut karte.snarl, &mut DemoViewer, ui);
    propagate_dirty(&mut karte.snarl);
}
