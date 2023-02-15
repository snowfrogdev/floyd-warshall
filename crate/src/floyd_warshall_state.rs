use serde::{Serialize, Deserialize};
use wasm_bindgen::prelude::*;

use crate::utils::get_1D_index_from;

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct FloydWarshallState {
    #[wasm_bindgen(readonly)]
    pub current_step: u32,
    #[wasm_bindgen(readonly)]
    pub current_line: u8,
    #[wasm_bindgen(readonly)]
    pub is_done: bool,
    #[wasm_bindgen(readonly)]
    pub V: u16,
    #[wasm_bindgen(readonly)]
    pub u: Option<u16>,
    #[wasm_bindgen(readonly)]
    pub v: Option<u16>,
    #[wasm_bindgen(readonly)]
    pub k: Option<u16>,
    #[wasm_bindgen(readonly)]
    pub i: Option<u16>,
    #[wasm_bindgen(readonly)]
    pub j: Option<u16>,
    dist: Option<Vec<u16>>,
    next: Option<Vec<Option<u16>>>,
}

impl FloydWarshallState {
    pub fn make(matrix_length: u16) -> Self {
        Self {
            current_step: 0,
            current_line: 1,
            is_done: false,
            V: matrix_length,
            u: None,
            v: None,
            k: None,
            i: None,
            j: None,
            dist: None,
            next: None,
        }
    }

    pub fn init_dist_from(&mut self, adjacency_matrix: &Vec<Vec<u8>>) {
        let dist = self.dist.get_or_insert_with(Vec::new);
        for y in 0..adjacency_matrix.len() {
            for x in 0..adjacency_matrix[y].len() {
                dist.push(adjacency_matrix[y][x] as u16);
            }
        }
    }

    pub fn init_next(&mut self) {
        let next = self.next.get_or_insert_with(Vec::new);
        for _ in 0..(self.V * self.V) {
            next.push(None);
        }
    }

    pub fn update_dist(&mut self, i: u16, j: u16, value: u16) {
        let index = get_1D_index_from(i.into(), j.into(), self.V.into());
        self.dist.as_mut().unwrap()[index] = value;
    }

    pub fn update_next(&mut self, i: u16, j: u16, value: Option<u16>) {
        let index = get_1D_index_from(i.into(), j.into(), self.V.into());
        self.next.as_mut().unwrap()[index] = value;
    }

    pub fn get_dist(&self, i: u16, j: u16) -> u16 {
        let index = get_1D_index_from(i.into(), j.into(), self.V.into());
        self.dist.as_ref().unwrap()[index]
    }

    pub fn get_next(&self, i: u16, j: u16) -> Option<u16> {
        let index = get_1D_index_from(i.into(), j.into(), self.V.into());
        self.next.as_ref().unwrap()[index]
    }
}
