mod utils;

use wasm_bindgen::prelude::*;
use crate::HexState::Water;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub fn add(a: u64, b: u64) -> u64 {
  return a + b;
}

#[wasm_bindgen]
pub struct MapState {
  pub width: u64,
  pub height: u64,
  pub hex_state: Vec<HexState>,
}

#[wasm_bindgen]
pub enum HexState {
  Water,
  Empty,
  Castle,
  House,
  Watchtower,
  Keeptower,
  PeasantReady,
  SpearmanReady,
  MercenaryReady,
  KnightReady,
  PeasantBreak,
  SpearmanBreak,
  MercenaryBreak,
  KnightBreak,
  Calvary,
  Tree,
}

#[wasm_bindgen]
pub fn generate_map(width: u64, height: u64) -> MapState {
  return MapState {
    width,
    height,
    hex_state: vec![Water]
  };
}
