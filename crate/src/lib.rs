#[macro_use]
mod utils;
mod floyd_warshall_algo;
mod floyd_warshall_state;
use floyd_warshall_algo::LINES;
use floyd_warshall_state::FloydWarshallState;
use utils::{set_panic_hook, worker_self};
use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub fn run(adjacency_matrix: &js_sys::Array, check_point_size: f64) -> Result<(), JsValue> {
    set_panic_hook();
    let self_ = worker_self().expect("Could not get reference to self.");

    let adjacency_matrix: Vec<Vec<u8>> = adjacency_matrix
        .to_vec()
        .iter()
        .map(|row| match js_sys::try_iter(row) {
            Ok(Some(iter)) => iter
                .map(|cell| cell.unwrap().as_f64().unwrap() as u8)
                .collect(),
            _ => panic!("Could not convert row to iterator."),
        })
        .collect();

    let mut state = FloydWarshallState::make(adjacency_matrix.len() as u16);
    while !state.is_done {
        let instruction = LINES[state.current_line as usize];
        state.current_line =
            instruction(&mut state, &adjacency_matrix).unwrap_or_else(|| state.current_line + 1);
        state.current_step += 1;
        let is_checkpoint = state.current_step % check_point_size as u32 == 0;
        if is_checkpoint {
            self_.post_message(&serde_wasm_bindgen::to_value(&state).unwrap())?
        }
    }

    self_.post_message(&serde_wasm_bindgen::to_value(&state).unwrap())?;
    self_.close();
    Ok(())
}
