// Pfad: ../src/Karten/basis-karte.rs

use eframe::egui::{Id, Ui, Style, Rect, Color32, Painter, Pos2,Vec2, pos2,vec2};
use egui_snarl::{
    InPin, NodeId, OutPin, Snarl,
    ui::{SnarlViewer, SnarlWidget, SnarlStyle, SnarlPin, PinInfo, BackgroundPattern},
};

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
        PinInfo::circle()
    }

    #[allow(refining_impl_trait)]
    fn show_output(
        &mut self,
        pin: &OutPin,
        ui: &mut Ui,
        snarl: &mut Snarl<Box<dyn Knoten>>,
    ) -> impl SnarlPin + 'static {
        snarl[pin.id.node].show_output(pin, ui);
        PinInfo::circle()
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
        if typen::compatible(&snarl[from.id.node].output_type(from.id.output), &snarl[to.id.node].input_type(to.id.input)) {
            snarl.connect(from.id, to.id);
        }
    }
}

/* -------------------------
   Widget-Helfer
--------------------------*/

pub fn show_demo_karte(
    karte: &mut DemoKarte,
    ui: &mut Ui,
) {
    SnarlWidget::new()
        .id(Id::new("demo-snarl"))
        .show(&mut karte.snarl, &mut DemoViewer, ui);
}
