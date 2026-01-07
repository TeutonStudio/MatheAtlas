// Pfad: ../src/Kontext/karte.rs

use eframe::egui::{Ui,RichText,FontId,TextStyle,Pos2,vec2};
use egui_snarl::{Snarl,InPinId,OutPinId,NodeId};

use crate::basis_knoten::{Knoten};

#[path = "../Knoten/Definitionen/element.rs"]
mod element_definition;
#[path = "../Knoten/Definitionen/logik.rs"]
mod logik_definition;
#[path = "../Knoten/Definitionen/menge.rs"]
mod menge_definition;
#[path = "../Knoten/Definitionen/abbild.rs"]
mod abbild_definition;

use element_definition::{DefiniereElementNode};
use logik_definition::{WahrNode,LügeNode};
use menge_definition::{DefiniereMengeNode, DefAuswahl};
use abbild_definition::{DefiniereAbbildNode};

#[path = "../Knoten/Operatoren/logik.rs"]
mod logik_operatoren;
#[path = "../Knoten/Operatoren/menge.rs"]
mod menge_operatoren;

use logik_operatoren::{LogikOperatorNode, LogikOp};
use menge_operatoren::{MengenOperatorNode, MengenOp};

#[path = "../Knoten/Relationen/menge.rs"]
mod menge_relationen;

use menge_relationen::{MengenRelationNode};


pub fn zeige_karten_kontext(
    pos: Pos2,
    ui: &mut Ui,
    snarl: &mut Snarl<Box<dyn Knoten>>,
) {
    ui.set_min_width(150.0);
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

        zeige_kategorien_kontext("Logik", ui, snarl, 
            Some(|snarl: &mut Snarl<Box<dyn Knoten>>| {
                let menge_id = snarl.insert_node(
                    pos - vec2(0.0, 35.0),
                    Box::new(DefiniereMengeNode::new_with_selected(DefAuswahl::Logik)),
                );
                let elem_id  = snarl.insert_node(pos + vec2(0.0, 35.0), Box::new(DefiniereElementNode::new()));

                // Menge -> Element
                snarl.connect(
                    OutPinId { node: menge_id, output: 0 },
                    InPinId  { node: elem_id,  input: 0  },
                );
            }),
            Some(|ui: &mut Ui,snarl: &mut Snarl<Box<dyn Knoten>>| {
                if ui.button("nicht").clicked() {
                    snarl.insert_node(pos, Box::new(LogikOperatorNode::new(LogikOp::Negation)));
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
                if ui.button("dann").clicked() {
                    snarl.insert_node(pos, Box::new(LogikOperatorNode::new(LogikOp::Implikation)));
                    ui.close();
                }
                if ui.button("gleich").clicked() {
                    snarl.insert_node(pos, Box::new(LogikOperatorNode::new(LogikOp::Äquivalenzrelation)));
                    ui.close();
                }
            }), None::<fn(&mut Ui, &mut Snarl<Box<dyn Knoten>>)>
        );

        zeige_kategorien_kontext(
            "Mengen",
            ui,snarl,
            Some(|snarl: &mut Snarl<Box<dyn Knoten>>| {
                snarl.insert_node(pos, Box::new(DefiniereMengeNode::new()));
            }),
            Some(|ui: &mut Ui,snarl: &mut Snarl<Box<dyn Knoten>>| {
                /*if ui.button("einzel").clicked() {
                    snarl.insert_node(pos, Box::new(MengenOperatorNode::new(MengenOp::Einzel)));
                    ui.close();
                }*/
                if ui.button("potenz").clicked() {
                    snarl.insert_node(pos, Box::new(MengenOperatorNode::new(MengenOp::Potenz)));
                    ui.close();
                }
                if ui.button("vereinigung").clicked() {
                    snarl.insert_node(pos, Box::new(MengenOperatorNode::new(MengenOp::Vereinigung)));
                    ui.close();
                }
                if ui.button("schnitt").clicked() {
                    snarl.insert_node(pos, Box::new(MengenOperatorNode::new(MengenOp::Schnitt)));
                    ui.close();
                }
                if ui.button("differenz").clicked() {
                    snarl.insert_node(pos, Box::new(MengenOperatorNode::new(MengenOp::Differenz)));
                    ui.close();
                }
                if ui.button("filter").clicked() {
                    snarl.insert_node(pos, Box::new(MengenOperatorNode::new(MengenOp::Filter)));
                    ui.close();
                }
            }),
            Some(|ui: &mut Ui,snarl: &mut Snarl<Box<dyn Knoten>>| {
                if ui.button("element").clicked() {
                    snarl.insert_node(pos, Box::new(MengenRelationNode::new(menge_relationen::RelOp::ElementVon)));
                    ui.close();
                }
                if ui.button("gleich").clicked() {
                    snarl.insert_node(pos, Box::new(MengenRelationNode::new(menge_relationen::RelOp::Gleichheit)));
                    ui.close();
                }
            }),
        );

        zeige_kategorien_kontext("Abbild", ui, snarl, 
            Some(|snarl: &mut Snarl<Box<dyn Knoten>>| {
                snarl.insert_node(pos, Box::new(DefiniereAbbildNode::new()));
            }),
            Some(|ui: &mut Ui,snarl: &mut Snarl<Box<dyn Knoten>>| {
                if ui.button("vereinigung").clicked() {
                    snarl.insert_node(pos, Box::new(MengenOperatorNode::new(MengenOp::Vereinigung)));
                    ui.close();
                }
                if ui.button("schnitt").clicked() {
                    snarl.insert_node(pos, Box::new(MengenOperatorNode::new(MengenOp::Schnitt)));
                    ui.close();
                }
            }),
            Some(|ui: &mut Ui,snarl: &mut Snarl<Box<dyn Knoten>>| {
                if ui.button("element").clicked() {
                    snarl.insert_node(pos, Box::new(MengenRelationNode::new(menge_relationen::RelOp::ElementVon)));
                    ui.close();
                }
                if ui.button("gleich").clicked() {
                    snarl.insert_node(pos, Box::new(MengenRelationNode::new(menge_relationen::RelOp::Gleichheit)));
                    ui.close();
                }
            }),
        );
    });
}

fn zeige_kategorien_kontext<D, O, R>(
    kategorie: &str,
    ui: &mut Ui,
    snarl: &mut Snarl<Box<dyn Knoten>>,
    mut definition: Option<D>,
    mut operatoren: Option<O>,
    mut relationen: Option<R>,
)
where
    D: FnMut(&mut Snarl<Box<dyn Knoten>>),
    O: FnMut(&mut Ui, &mut Snarl<Box<dyn Knoten>>),
    R: FnMut(&mut Ui, &mut Snarl<Box<dyn Knoten>>),
{
    ui.label(RichText::new(kategorie).size(10.0));

    if let Some(def) = definition.as_mut() {
        if ui.button("Definition").clicked() {
            def(snarl);
            ui.close();
        }
    }

    if let Some(ops) = operatoren.as_mut() {
        zeige_sub_karten_kontext("Operatoren", ui, |ui| ops(ui, snarl));
    }

    if let Some(rel) = relationen.as_mut() {
        zeige_sub_karten_kontext("Relation", ui, |ui| rel(ui, snarl));
    }
}



fn zeige_sub_karten_kontext(
    abschnitt: &str,
    ui: &mut Ui,
    add_contents: impl FnOnce(&mut Ui),
) {
    ui.menu_button(abschnitt, add_contents);
}
