// Pfad: ../src/Kontext/karte.rs

use eframe::egui::{Ui,RichText,FontId,TextStyle,Pos2,vec2};
use egui_snarl::Snarl;

use crate::basis_knoten::{Knoten};

#[path = "../Knoten/Definitionen/element.rs"]
mod element_definition;
#[path = "../Knoten/Definitionen/menge.rs"]
mod menge_definition;

use element_definition::{DefiniereElementNode};
use menge_definition::{DefiniereMengeNode};

#[path = "../Knoten/Operatoren/logik.rs"]
mod logik_operatoren;
#[path = "../Knoten/Operatoren/menge.rs"]
mod menge_operatoren;

use logik_operatoren::{LogikOperatorNode, LogikOp};
use menge_operatoren::{MengenOperatorNode, MengenOp};

pub fn zeige_karten_kontext(
    pos: Pos2,
    ui: &mut Ui,
    snarl: &mut Snarl<Box<dyn Knoten>>,
) {
    ui.scope(|ui| {
        // Standard-Text kleiner
        ui.style_mut().text_styles.insert(
            TextStyle::Body,
            FontId::proportional(11.0),
        );
        ui.style_mut().text_styles.insert(
            TextStyle::Button,
            FontId::proportional(11.0),
        );
        ui.style_mut().text_styles.insert(
            TextStyle::Heading,
            FontId::proportional(12.0),
        );
        ui.label(RichText::new("neuer Knoten"));
        ui.separator();

        ui.label(RichText::new("Logik").size(10.0));
        if ui.button("zustand").clicked() {
            // Erzeugt zwei Knoten, MengenKnoten mit {Wahr,Lüge} und damit verbundenen definiere ElementKnoten, welcher die auswahl zulässt
            let pos2 = pos + vec2(0.0, 35.0);
            snarl.insert_node(pos, Box::new(DefiniereMengeNode::new()));
            snarl.insert_node(pos2, Box::new(DefiniereElementNode::new()));
            ui.close();
        }
        if ui.button("und").clicked() {
            snarl.insert_node(pos, Box::new(LogikOperatorNode::new(LogikOp::Konjunktion)));
            ui.close();
        }
        if ui.button("oder").clicked() {
            snarl.insert_node(pos, Box::new(LogikOperatorNode::new(LogikOp::Disjunktion)));
            ui.close();
        }

        ui.label(RichText::new("Mengen").size(10.0));
        if ui.button("Legacy").clicked() {
            snarl.insert_node(pos, Box::new(DefiniereMengeNode::new()));
            ui.close();
        }
        if ui.button("Vereinigung").clicked() {
            snarl.insert_node(pos, Box::new(MengenOperatorNode::new(MengenOp::Vereinigung)));
            ui.close();
        }
        if ui.button("Schnitt").clicked() {
            snarl.insert_node(pos, Box::new(MengenOperatorNode::new(MengenOp::Schnitt)));
            ui.close();
        }
    });
}
