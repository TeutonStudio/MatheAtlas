// Pfad: ../src/main.rs

#[path = "typen.rs"]
mod typen;

#[path = "LaTeX/mod.rs"]
mod LaTeX;

#[path = "Knoten/basis-knoten.rs"]
mod basis_knoten;
#[path = "Knoten/latex-knoten.rs"]
mod latex_knoten;


#[path = "Karten/basis-karte.rs"]
mod basis_karte;

/*#[path = "Karten/definitions-karte.rs"]
mod definitions_karte;*/


use basis_karte::{DemoKarte, show_demo_karte};
use eframe::{
    egui::{Context,CentralPanel},
    Frame,
    Result,
    NativeOptions,
    App,
};

fn erhalte_titel() -> String {
    const VERSION: &str = env!("CARGO_PKG_VERSION");
    return format!("Mathematik Atlas ({})", VERSION);
}

struct Anwendung {
    karte: DemoKarte,
}

impl Anwendung {
    fn new() -> Self {
        Self {
            karte: DemoKarte::new(),
        }
    }
}

impl App for Anwendung {
    fn update(&mut self, ctx: &Context, _: &mut Frame) {
        ctx.set_pixels_per_point(1.0);
        CentralPanel::default().show(ctx, |ui| {
            show_demo_karte(&mut self.karte, ui);
        });
    }
}

fn main() -> Result<()> {
    eframe::run_native(
        &erhalte_titel(),
        NativeOptions::default(),
        Box::new(|_| Ok(Box::new(Anwendung::new()))),
    )
}
