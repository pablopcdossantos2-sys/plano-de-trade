use std::{
    fs,
    io::{self, Write},
    path::Path,
};

const ICON_SIZE: usize = 32;

fn set_pixel(pixels: &mut [u8], x: usize, y: usize, rgba: [u8; 4]) {
    if x >= ICON_SIZE || y >= ICON_SIZE {
        return;
    }
    let index = (y * ICON_SIZE + x) * 4;
    pixels[index..index + 4].copy_from_slice(&rgba);
}

fn fill_rect(
    pixels: &mut [u8],
    x0: usize,
    y0: usize,
    x1: usize,
    y1: usize,
    rgba: [u8; 4],
) {
    for y in y0..=y1.min(ICON_SIZE - 1) {
        for x in x0..=x1.min(ICON_SIZE - 1) {
            set_pixel(pixels, x, y, rgba);
        }
    }
}

fn trade_blueprint_icon() -> Vec<u8> {
    let dark = [17, 24, 39, 255];
    let cyan = [56, 189, 248, 255];
    let white = [255, 255, 255, 255];

    let mut pixels = vec![0_u8; ICON_SIZE * ICON_SIZE * 4];
    for y in 0..ICON_SIZE {
        for x in 0..ICON_SIZE {
            set_pixel(&mut pixels, x, y, dark);
        }
    }

    fill_rect(&mut pixels, 2, 2, 29, 3, cyan);
    fill_rect(&mut pixels, 2, 28, 29, 29, cyan);
    fill_rect(&mut pixels, 2, 2, 3, 29, cyan);
    fill_rect(&mut pixels, 28, 2, 29, 29, cyan);

    // T
    fill_rect(&mut pixels, 6, 8, 14, 10, white);
    fill_rect(&mut pixels, 9, 10, 11, 24, white);

    // B
    fill_rect(&mut pixels, 18, 8, 20, 24, white);
    fill_rect(&mut pixels, 20, 8, 25, 10, white);
    fill_rect(&mut pixels, 20, 15, 25, 17, white);
    fill_rect(&mut pixels, 20, 22, 25, 24, white);
    fill_rect(&mut pixels, 24, 10, 26, 15, white);
    fill_rect(&mut pixels, 24, 17, 26, 22, white);

    pixels
}

fn push_u16(buffer: &mut Vec<u8>, value: u16) {
    buffer.extend_from_slice(&value.to_le_bytes());
}

fn push_u32(buffer: &mut Vec<u8>, value: u32) {
    buffer.extend_from_slice(&value.to_le_bytes());
}

fn write_windows_icon(path: &Path) -> io::Result<()> {
    let pixels = trade_blueprint_icon();
    let xor_size = (ICON_SIZE * ICON_SIZE * 4) as u32;
    let and_row_bytes = ICON_SIZE.div_ceil(32) * 4;
    let and_size = (and_row_bytes * ICON_SIZE) as u32;
    let image_size = 40 + xor_size + and_size;

    let mut ico = Vec::with_capacity((22 + image_size) as usize);

    // ICONDIR
    push_u16(&mut ico, 0);
    push_u16(&mut ico, 1);
    push_u16(&mut ico, 1);

    // ICONDIRENTRY
    ico.push(ICON_SIZE as u8);
    ico.push(ICON_SIZE as u8);
    ico.push(0);
    ico.push(0);
    push_u16(&mut ico, 1);
    push_u16(&mut ico, 32);
    push_u32(&mut ico, image_size);
    push_u32(&mut ico, 22);

    // BITMAPINFOHEADER
    push_u32(&mut ico, 40);
    push_u32(&mut ico, ICON_SIZE as u32);
    push_u32(&mut ico, (ICON_SIZE * 2) as u32);
    push_u16(&mut ico, 1);
    push_u16(&mut ico, 32);
    push_u32(&mut ico, 0);
    push_u32(&mut ico, xor_size);
    push_u32(&mut ico, 0);
    push_u32(&mut ico, 0);
    push_u32(&mut ico, 0);
    push_u32(&mut ico, 0);

    // XOR bitmap: Windows ICO stores rows bottom-up in BGRA order.
    for y in (0..ICON_SIZE).rev() {
        for x in 0..ICON_SIZE {
            let index = (y * ICON_SIZE + x) * 4;
            let [r, g, b, a] = [
                pixels[index],
                pixels[index + 1],
                pixels[index + 2],
                pixels[index + 3],
            ];
            ico.extend_from_slice(&[b, g, r, a]);
        }
    }

    // AND transparency mask: all zero because alpha already defines opacity.
    ico.resize(ico.len() + and_size as usize, 0);

    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }
    let mut file = fs::File::create(path)?;
    file.write_all(&ico)
}

fn ensure_windows_icon() -> io::Result<()> {
    let icon = Path::new("icons/icon.ico");
    if icon.exists() {
        return Ok(());
    }
    write_windows_icon(icon)
}

fn main() {
    ensure_windows_icon().expect("failed to generate src-tauri/icons/icon.ico");
    tauri_build::build()
}
