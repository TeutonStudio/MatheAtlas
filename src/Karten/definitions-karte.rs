// Pfad: ../src/Karten/definitions-karte.rs

use egui_snarl::{OutPin, InPin};

pub struct DefinitionsKarte;

impl SnarlViewer<Box<dyn Knoten>> for DefinitionsKarte {
    fn connect(
        &mut self,
        _from: &OutPin,
        _to: &InPin,
        _snarl: &mut Snarl<Box<dyn Knoten>>,
    ) {
        // read-only: nix
    }

    fn disconnect(
        &mut self,
        _from: &OutPin,
        _to: &InPin,
        _snarl: &mut Snarl<Box<dyn Knoten>>,
    ) {
        // read-only: nix
    }

    // die show_* Methoden musst du wie bei deinem normalen Viewer implementieren
    // oder du re-uses deine existierende Anzeige-Logik, nur ohne Änderungen.
}
