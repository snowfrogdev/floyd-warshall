use web_sys::DedicatedWorkerGlobalScope;

pub fn set_panic_hook() {
    // When the `console_error_panic_hook` feature is enabled, we can call the
    // `set_panic_hook` function at least once during initialization, and then
    // we will get better error messages if our code ever panics.
    //
    // For more details see
    // https://github.com/rustwasm/console_error_panic_hook#readme
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

// Getter for the global `self` object, if it is a `DedicatedWorkerGlobalScope`.
pub fn worker_self() -> Option<DedicatedWorkerGlobalScope> {
    use wasm_bindgen::JsCast;
    js_sys::global()
        .dyn_into::<DedicatedWorkerGlobalScope>()
        .ok()
}

// A macro to provide `println!(..)`-style syntax for `console.log` logging.
macro_rules! log {
    ( $( $t:tt )* ) => {
        web_sys::console::log_1(&format!( $( $t )* ).into());
    }
}

pub fn get_1D_index_from(y: usize, x: usize, width: usize) -> usize {
    y * width + x
}
