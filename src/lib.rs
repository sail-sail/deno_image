use deno_bindgen::deno_bindgen;

use std::io::Cursor;
use image::io::Reader as ImageReader;
use image::ImageOutputFormat;
use image::imageops::FilterType;
use image::GenericImageView;

fn _resize(
  content: &[u8],
  f: &str,
  w: u32,
  h: u32,
  q: u8,
) -> Vec<u8> {
  let len = content.len();
  let format = {
    if f.is_empty() {
      "webp".to_owned()
    } else {
      f.to_owned()
    }
  };
  let img = ImageReader::new(Cursor::new(&content)).with_guessed_format().unwrap().decode().unwrap();
  let (width, height) = img.dimensions();
  let nwidth = {
    if w == 0 || w > width {
      width
    } else {
      w
    }
  };
  let nheight = {
    if h == 0 || h > height {
      height
    } else {
      h
    }
  };
  // if nwidth == width && nheight == height {
  //   return content.to_owned();
  // }
  let q: u8 = if q == 0 {
    80
  } else if q > 100 {
    100
  } else {
    q
  };
  let output_format = match format.as_str() {
    "jpg" => ImageOutputFormat::Jpeg(q),
    "png" => ImageOutputFormat::Png,
    "ico" => ImageOutputFormat::Ico,
    "webp" => ImageOutputFormat::WebP,
    _ => ImageOutputFormat::WebP,
  };
  let img = img.resize(nwidth, nheight, FilterType::Lanczos3);
  // let img = img.into_rgba8();
  let mut content: Vec<u8> = Vec::with_capacity(len);
  img.write_to(&mut Cursor::new(&mut content), output_format).unwrap();
  content
}


#[deno_bindgen(non_blocking)]
fn resize(
  content: &[u8],
  f: &str,
  w: u32,
  h: u32,
  q: u8,
) -> Vec<u8> {
  _resize(content, f, w, h, q)
}

#[deno_bindgen]
fn resize_sync(
  content: &[u8],
  f: &str,
  w: u32,
  h: u32,
  q: u8,
) -> Vec<u8> {
  _resize(content, f, w, h, q)
}
