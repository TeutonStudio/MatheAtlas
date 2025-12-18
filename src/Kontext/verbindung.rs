// Pfad: Pfad: ../src/Kontext/verbindung.rs

use eframe::egui::{Id, Ui, Style, Rect, Color32, Stroke, Painter, Pos2,Vec2, pos2,vec2};
use egui_snarl::{
    InPin, NodeId, OutPin, Snarl, InPinId, OutPinId,
    ui::{SnarlViewer, SnarlWidget, SnarlStyle, SnarlPin, PinInfo, PinShape, BackgroundPattern, PinPlacement::Edge},
};
use crate::basis_knoten::Knoten;

pub fn zeige_verbindung_kontext(
    pos: Pos2,
    ui: &mut Ui,
    src_pins: egui_snarl::ui::AnyPins,
    snarl: &mut Snarl<Box<dyn Knoten>>,
) {

}