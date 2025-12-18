// Pfad: ../src/LaTeX/interpreter.rs

use std::{
    collections::hash_map::DefaultHasher,
    hash::{Hash, Hasher},
};
use tiny_skia::Pixmap;
use eframe::egui::{ColorImage, Image, TextureHandle, TextureOptions, Ui, Context, vec2};
use crate::typen::{OutputInfo};
use usvg::{Options as UsvgOptions};
use mathjax::MathJax;

pub trait LaTeXQuellBereitsteller: Send + Sync {
    fn title(&self, inputs: &[OutputInfo]) -> Option<String>;
    fn body(&self, inputs: &[OutputInfo]) -> Option<String>;
    fn footer(&self, inputs: &[OutputInfo]) -> Option<String>;

    fn in_pin_label(&self, pin_index: usize, inputs: &[OutputInfo]) -> Option<String>;
    fn out_pin_label(&self, pin_index: usize, inputs: &[OutputInfo]) -> Option<String>;

    fn in_pins(&self, inputs: &[OutputInfo]) -> usize;
    fn out_pins(&self, inputs: &[OutputInfo]) -> usize;
}

fn erhalte_hash(str: &String) -> u64 {
    let mut h = DefaultHasher::new();
    str.hash(&mut h);
    return h.finish();
}

pub struct LaTeXQuelle {
    src: String,
    src_hash: u64, // TODO braucht es diesen, da new_src =?= src

    svg: Option<String>,
    last_raster_scale: f32,
    texture: Option<TextureHandle>,
    pixel_size: [usize; 2],

    error: Option<String>,
    last_logged_error_hash: u64,
}

impl LaTeXQuelle {
    pub fn new() -> Self {
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

    fn clear(&mut self) {
        self.src.clear();
        self.src_hash = 0;
        self.svg = None;
        self.texture = None;
        self.error = None;
        self.last_raster_scale = -1.0;
        self.last_logged_error_hash = 0;
    }   

    fn set_src(&mut self, new_src: String) -> bool {
        let new_hash = erhalte_hash(&new_src);
        if new_hash != self.src_hash {
            self.src = new_src;
            self.src_hash = new_hash;
            self.svg = None;
            self.texture = None;
            self.error = None;
            self.last_raster_scale = -1.0;
            self.last_logged_error_hash = 0;
            return true;
        }
        return false;
    }

    fn set_src_opt(&mut self, new_src: Option<String>) -> bool {
        match new_src {
            None => {
                if self.src_hash != 0 || !self.src.is_empty() || self.svg.is_some() || self.texture.is_some() {
                    self.clear();
                    self.last_logged_error_hash = 0;
                    return true;
                }
                return false;
            }
            Some(src) => { return self.set_src(src) }
        }
    }

    pub fn show(&mut self, ui: &mut Ui) {
        let raster_scale = ui.ctx().pixels_per_point() * 3.0;

        self.render_section_if_needed(ui.ctx(), raster_scale);

        if let Some(tex) = &self.texture {
            // Optional: EXAKT zeichnen, damit egui nicht nochmal skaliert (schärfer).
            let size_points = vec2(
                self.pixel_size[0] as f32 / raster_scale,
                self.pixel_size[1] as f32 / raster_scale,
            );
            ui.add(Image::new(tex).fit_to_exact_size(size_points));
        } else {
            ui.label("…");
        }
    }

    fn tex_to_svg_with_mathjax(tex: &str) -> Result<String, String> {
        let renderer = MathJax::new().unwrap();
        let result = renderer.render(tex).unwrap();
        let svg_string = result.into_raw();
        return Ok(svg_string);
    }
    fn render_latex_src_to_svg(fragment: &str) -> Result<String, String> {
        Self::tex_to_svg_with_mathjax(fragment)
    }
    
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
        &mut self,
        ctx: &Context,
        scale: f32,
    ) {
        // 1) SVG fehlt? -> neu erzeugen
        if self.svg.is_none() && !self.src.trim().is_empty() {
            match Self::render_latex_src_to_svg(&self.src) {
                Ok(svg) => {
                    self.svg = Some(svg);
                    self.error = None;
                }
                Err(e) => {
                    let err_hash = {
                        use std::hash::{Hash, Hasher};
                        let mut h = DefaultHasher::new();
                        self.src_hash.hash(&mut h);
                        e.hash(&mut h);
                        h.finish()
                    };

                    if self.last_logged_error_hash != err_hash {
                        self.last_logged_error_hash = err_hash;

                        eprintln!("================ LaTeX RENDER FAILED ================");
                        eprintln!("Error: {e}");
                        eprintln!("------------------ LaTeX source ----------------------");
                        eprintln!("{}", self.src);
                        eprintln!("======================================================");
                    }

                    self.svg = None;
                    self.texture = None;
                    self.error = Some(e);
                }
            }
        }

        // 2) Raster fehlt oder Scale geändert? -> neu rasterisieren
        let need_raster = self.texture.is_none() || (self.last_raster_scale - scale).abs() > 0.010;
        if need_raster {
            if let Some(svg) = self.svg.as_deref() {
                match Self::svg_to_texture(svg, ctx, scale) {
                    Ok((tex, px)) => {
                        self.texture = Some(tex);
                        self.pixel_size = px;
                        self.last_raster_scale = scale;
                        self.error = None;
                    }
                    Err(e) => {
                        self.texture = None;
                        self.error = Some(e);
                    }
                }
            }
        }
    }
}
