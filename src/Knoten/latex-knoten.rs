// Pfad: ../src/Knoten/latex-knoten.rs

use std::{
    collections::hash_map::DefaultHasher,
    hash::{Hash, Hasher},
    path::{Path, PathBuf},
    process::Command,
    time::{SystemTime, UNIX_EPOCH},
    io::Write,
};

use eframe::egui::{ColorImage, Image, TextureHandle, TextureOptions, Ui, Context, Color32, vec2};

use egui_snarl::{InPin, OutPin, NodeId};

use usvg::{Options as UsvgOptions};
use tiny_skia::Pixmap;

use crate::typen::{PinType,OutputInfo};
use crate::basis_knoten::{Knoten};


fn show_section_at(
    section: &mut LatexSection,
    ui: &mut Ui,
    supersample: f32,
) {
    let ppp = ui.ctx().pixels_per_point();
    let raster_scale = ppp * supersample;

    LatexNode::render_section_if_needed(section, ui.ctx(), raster_scale);

    if let Some(tex) = &section.texture {
        // Optional: EXAKT zeichnen, damit egui nicht nochmal skaliert (schärfer).
        let size_points = vec2(
            section.pixel_size[0] as f32 / raster_scale,
            section.pixel_size[1] as f32 / raster_scale,
        );
        ui.add(Image::new(tex).fit_to_exact_size(size_points));
    } else {
        ui.label("…");
    }
}



/// Trait: Die Anwendung liefert hiermit LaTeX-Strings basierend auf Inputs.
/// (Du wolltest: App generiert Strings, Node rendert nur.)
pub trait LatexSourceProvider: Send + Sync {
    fn title(&self, inputs: &[OutputInfo]) -> Option<String>;
    fn body(&self, inputs: &[OutputInfo]) -> Option<String>;
    fn footer(&self, inputs: &[OutputInfo]) -> Option<String>;

    fn in_pin_label(&self, pin_index: usize, inputs: &[OutputInfo]) -> Option<String>;
    fn out_pin_label(&self, pin_index: usize, inputs: &[OutputInfo]) -> Option<String>;

    fn in_pins(&self, inputs: &[OutputInfo]) -> usize;
    fn out_pins(&self, inputs: &[OutputInfo]) -> usize;
}

/// Ein Bereich (Title/Body/Footer/Pinlabel) als gerenderte Grafik mit Cache.
struct LatexSection {
    src: String,
    src_hash: u64,

    svg: Option<String>,
    last_raster_scale: f32,
    texture: Option<TextureHandle>,
    pixel_size: [usize; 2],

    error: Option<String>,
    last_logged_error_hash: u64,
}

impl LatexSection {
    fn new() -> Self {
        Self {
            src: String::new(),
            src_hash: 0,
            svg: None,
            last_raster_scale: -1.0,
            texture: None,
            pixel_size: [1, 1],
            error: None,
            last_logged_error_hash: 0,
        }
    }

    fn set_src(&mut self, new_src: String) -> bool {
        let mut h = DefaultHasher::new();
        new_src.hash(&mut h);
        let new_hash = h.finish();

        let changed = new_hash != self.src_hash;
        if changed {
            self.src = new_src;
            self.src_hash = new_hash;
            self.svg = None;
            self.texture = None;
            self.error = None;
            self.last_raster_scale = -1.0;
            self.last_logged_error_hash = 0;
        }
        changed
    }

    fn clear(&mut self) {
        self.src.clear();
        self.src_hash = 0;
        self.svg = None;
        self.texture = None;
        self.error = None;
        self.last_raster_scale = -1.0;
        self.last_logged_error_hash = 0;
    }   

    fn set_src_opt(&mut self, new_src: Option<String>) -> bool {
        match new_src {
            None => {
                let changed = self.src_hash != 0 || !self.src.is_empty() || self.svg.is_some() || self.texture.is_some();
                if changed {
                    self.clear();
                    self.last_logged_error_hash = 0;
                }
                changed
            }
            Some(src) => { self.set_src(src) }
        }
    }
}

/// LatexNode: rendert Title/Body/Footer + Pin-Labels als LaTeX → SVG → Texture.
pub struct LatexNode {
    name: String,

    provider: Box<dyn LatexSourceProvider>,

    // letzte Inputs (Infos) dieses Knotens
    inputs: Vec<OutputInfo>,

    // dynamische Pin-Anzahlen
    in_count: usize,
    out_count: usize,

    // Bereiche
    title: LatexSection,
    body: LatexSection,
    footer: LatexSection,

    in_pin_sections: Vec<LatexSection>,
    out_pin_sections: Vec<LatexSection>,

    // Error Badge
    had_error: bool,
}

impl LatexNode {
    pub fn new(name: impl Into<String>, provider: Box<dyn LatexSourceProvider>) -> Self {
        Self {
            name: name.into(),
            provider,
            inputs: vec![],
            in_count: 1,
            out_count: 1,
            title: LatexSection::new(),
            body: LatexSection::new(),
            footer: LatexSection::new(),
            in_pin_sections: vec![LatexSection::new()],
            out_pin_sections: vec![LatexSection::new()],
            had_error: false,
        }
    }
    
    fn tex_to_svg_with_mathjax(tex: &str) -> Result<String, String> {
        use mathjax::MathJax;

        let expression = r#"y=\frac{1}{x}"#;
        let renderer = MathJax::new().unwrap();
        let result = renderer.render(tex).unwrap();
        let svg_string = result.into_raw(); // This is a `<svg></svg>` element.
        return Ok(svg_string);
    }
    fn render_latex_src_to_svg(fragment: &str) -> Result<String, String> {
        // WICHTIG:
        // MathJax erwartet TeX-MATH, kein LaTeX-Dokument.
        // Also fragment sollte sowas sein wie: r"\frac{a}{b}" oder "x^2+1"
        // Wenn du bisher "$...$" lieferst: geht meistens auch, aber besser ohne $.
        let display = true; // oder heuristisch: enthält \begin{aligned} etc.
        Self::tex_to_svg_with_mathjax(fragment)
    }

    fn ensure_pin_vec_sizes(&mut self) {
        self.in_pin_sections.resize_with(self.in_count, LatexSection::new);
        self.out_pin_sections.resize_with(self.out_count, LatexSection::new);
    }

    /// SVG → egui Texture (raster) via usvg+resvg+tiny-skia.
    fn svg_to_texture(
        svg: &str,
        ctx: &Context,
        scale: f32,
    ) -> Result<(TextureHandle, [usize; 2]), String> {
        let opt = UsvgOptions::default();
        // opt.keep_named_groups = false; Existiert nicht

        let tree = usvg::Tree::from_str(svg, &opt)
            .map_err(|e| format!("SVG parse failed: {e}"))?;

        // Text -> path (sicher) Existiert nicht
        // tree.convert_text(&opt.to_ref())
        //    .map_err(|e| format!("SVG text->path failed: {e}"))?;

        let size = tree.size();
        let w = (size.width() as f32 * scale).ceil().max(1.0) as u32;
        let h = (size.height() as f32 * scale).ceil().max(1.0) as u32;

        let mut pixmap = Pixmap::new(w, h).ok_or("Failed to allocate pixmap")?;

        // Render
        resvg::render(
            &tree,
            usvg::Transform::from_scale(scale, scale),
            &mut pixmap.as_mut(),
        ); //.ok_or("resvg render failed")?;

        // tiny-skia RGBA -> egui ColorImage
        let img = ColorImage::from_rgba_unmultiplied(
            [w as usize, h as usize],
            pixmap.data(),
        );

        let tex = ctx.load_texture("latex_section", img, TextureOptions::NEAREST);
        Ok((tex, [w as usize, h as usize]))
    }

    /// Render-Logik für einen Bereich: compile+svg+texture, cached.
    fn render_section_if_needed(
        section: &mut LatexSection,
        ctx: &Context,
        scale: f32,
    ) {
        // 1) SVG fehlt? -> neu erzeugen
        if section.svg.is_none() && !section.src.trim().is_empty() {
            match Self::render_latex_src_to_svg(&section.src) {
                Ok(svg) => {
                    section.svg = Some(svg);
                    section.error = None;
                }
                Err(e) => {
                    let err_hash = {
                        use std::hash::{Hash, Hasher};
                        let mut h = DefaultHasher::new();
                        section.src_hash.hash(&mut h);
                        e.hash(&mut h);
                        h.finish()
                    };

                    if section.last_logged_error_hash != err_hash {
                        section.last_logged_error_hash = err_hash;

                        eprintln!("================ LaTeX RENDER FAILED ================");
                        eprintln!("Error: {e}");
                        eprintln!("------------------ LaTeX source ----------------------");
                        eprintln!("{}", section.src);
                        eprintln!("======================================================");
                    }

                    section.svg = None;
                    section.texture = None;
                    section.error = Some(e);
                }
            }
        }

        // 2) Raster fehlt oder Scale geändert? -> neu rasterisieren
        let need_raster = section.texture.is_none() || (section.last_raster_scale - scale).abs() > 0.010;
        if need_raster {
            if let Some(svg) = section.svg.as_deref() {
                match Self::svg_to_texture(svg, ctx, scale) {
                    Ok((tex, px)) => {
                        section.texture = Some(tex);
                        section.pixel_size = px;
                        section.last_raster_scale = scale;
                        section.error = None;
                    }
                    Err(e) => {
                        section.texture = None;
                        section.error = Some(e);
                    }
                }
            }
        }
    }

}

impl Knoten for LatexNode {
    fn name(&self) -> &str {
        &self.name
    }

    fn inputs(&self) -> usize {
        self.in_count
    }

    fn outputs(&self) -> usize {
        self.out_count
    }

    fn input_type(&self, _i: usize) -> PinType {
        return PinType::Element;
    }

    fn output_type(&self, _o: usize) -> PinType {
        return PinType::Zahl;
    }

    fn output_info(&self, _output: usize) -> OutputInfo {
        // Für LaTeX-Knoten: z.B. Body als “Text-Info” weiterreichen.
        // Du kannst später z.B. echtes LaTeX weiterreichen.
        OutputInfo { latex: r"\LaTeX".to_string(), ty: PinType::Element, set_id: None }
        //OutputInfo { text: self.body.src.clone() }
    }

    fn on_inputs_changed(&mut self, inputs: Vec<Option<OutputInfo>>) {
        // 1) Inputs (Option) -> nur verbundene Infos sammeln
        self.inputs = inputs.into_iter().flatten().collect();

        // 2) Pin-Anzahlen dynamisch aus Inputs ableiten
        self.in_count = self.provider.in_pins(&self.inputs).max(1);
        self.out_count = self.provider.out_pins(&self.inputs).max(1);
        self.ensure_pin_vec_sizes();

        // 3) Quellen nur setzen, wenn Provider Some liefert
        let _t = self.title.set_src_opt(self.provider.title(&self.inputs));
        let _b = self.body.set_src_opt(self.provider.body(&self.inputs));
        let _f = self.footer.set_src_opt(self.provider.footer(&self.inputs));

        for i in 0..self.in_count {
            let src = self.provider.in_pin_label(i, &self.inputs);
            let _ = self.in_pin_sections[i].set_src_opt(src);
        }
        for i in 0..self.out_count {
            let src = self.provider.out_pin_label(i, &self.inputs);
            let _ = self.out_pin_sections[i].set_src_opt(src);
        }
    }


    fn show_input(&mut self, pin: &InPin, ui: &mut Ui) {
        if let Some(section) = self.in_pin_sections.get_mut(pin.id.input) {
            let ppp: f32 = ui.ctx().pixels_per_point();
            let raster_scale = ppp * 3.0;

            LatexNode::render_section_if_needed(section, ui.ctx(), raster_scale);

            if let Some(tex) = &section.texture {
                // Optional: EXAKT zeichnen, damit egui nicht nochmal skaliert (schärfer).
                let size_points = vec2(
                    section.pixel_size[0] as f32 / raster_scale,
                    section.pixel_size[1] as f32 / raster_scale,
                );
                ui.add(Image::new(tex).fit_to_exact_size(size_points));
            } else {
                ui.label("…");
            }
        } else {
            ui.label("?");
        }
    }

    fn show_output(&mut self, pin: &OutPin, ui: &mut Ui) {
        if let Some(section) = self.out_pin_sections.get_mut(pin.id.output) {
            let ppp = ui.ctx().pixels_per_point();
            let raster_scale = ppp * 3.0;

            LatexNode::render_section_if_needed(section, ui.ctx(), raster_scale);

            if let Some(tex) = &section.texture {
                // Optional: EXAKT zeichnen, damit egui nicht nochmal skaliert (schärfer).
                let size_points = vec2(
                    section.pixel_size[0] as f32 / raster_scale,
                    section.pixel_size[1] as f32 / raster_scale,
                );
                ui.add(Image::new(tex).fit_to_exact_size(size_points));
            } else {
                ui.label("…");
            }
        } else {
            ui.label("?");
        }
    }

    fn show_body(&mut self, node: NodeId, inputs: &[InPin],outputs: &[OutPin],ui: &mut Ui,) {
        let raster_scale = ui.ctx().pixels_per_point();
        LatexNode::render_section_if_needed(&mut self.body, ui.ctx(), raster_scale);

        if let Some(tex) = &self.body.texture {
            // Optional: EXAKT zeichnen, damit egui nicht nochmal skaliert (schärfer).
            let size_points = vec2(
                self.body.pixel_size[0] as f32 / raster_scale,
                self.body.pixel_size[1] as f32 / raster_scale,
            );
            ui.add(Image::new(tex).fit_to_exact_size(size_points));
        } else {
            ui.label("…");
        }
        
    }

    fn show_header(&mut self, node: NodeId, inputs: &[InPin], outputs: &[OutPin],ui: &mut Ui) {
        let raster_scale = ui.ctx().pixels_per_point();
        LatexNode::render_section_if_needed(&mut self.title, ui.ctx(), raster_scale);

        if let Some(tex) = &self.title.texture {
            // Optional: EXAKT zeichnen, damit egui nicht nochmal skaliert (schärfer).
            let size_points = vec2(
                self.title.pixel_size[0] as f32 / raster_scale,
                self.title.pixel_size[1] as f32 / raster_scale,
            );
            ui.add(Image::new(tex).fit_to_exact_size(size_points));
        } else {
            ui.label("…");
        }
        
    }

    fn as_any(&mut self) -> &mut dyn std::any::Any {
        self
    }
}
