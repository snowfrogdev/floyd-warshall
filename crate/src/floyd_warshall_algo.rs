use crate::floyd_warshall_state::FloydWarshallState;

type Line = fn(&mut FloydWarshallState, &Vec<Vec<u8>>) -> Option<u8>;

pub const LINES: [Line; 23] = [
    /* 0 */ |_, _| None,
    /* 1 */ |_, _| None,
    /* 2 */ |state, matrix| {
        state.init_dist_from(matrix);
        None
    },
    /* 3 */ |state, _| {
        state.init_next();
        None
    },
    /* 4 */
    |state, _| {
        let u = state.u.map_or(0, |u| u + 1);
        if u >= state.V {
            state.u = None;
            Some(15)
        } else {
            state.u = Some(u);
            None
        }
    },
    /* 5 */
    |state, _| {
        let v = state.v.map_or(0, |v| v + 1);
        if v >= state.V {
            state.v = None;
            Some(4)
        } else {
            state.v = Some(v);
            None
        }
    },
    /* 6 */ |state, _| if state.u == state.v { None } else { Some(9) },
    /* 7 */
    |state, _| {
        state.update_dist(state.v.unwrap(), state.v.unwrap(), 0);
        None
    },
    /* 8 */
    |state, _| {
        state.update_next(state.v.unwrap(), state.v.unwrap(), state.v);
        Some(5)
    },
    /* 9 */
    |state, matrix| {
        if matrix[state.u.unwrap() as usize][state.v.unwrap() as usize] == 0 {
            None
        } else {
            Some(12)
        }
    },
    /* 10 */
    |state, _| {
        state.update_next(state.u.unwrap(), state.v.unwrap(), state.v);
        Some(5)
    },
    /* 11 */ |_, _| None,
    /* 12 */
    |state, _| {
        state.update_dist(state.u.unwrap(), state.v.unwrap(), u16::MAX);
        None
    },
    /* 13 */
    |state, _| {
        state.update_next(state.u.unwrap(), state.v.unwrap(), None);
        Some(5)
    },
    /* 14 */ |_, _| None,
    /* 15 */
    |state, _| {
        let k = state.k.map_or(0, |k| k + 1);
        if k >= state.V {
            state.k = None;
            Some(22)
        } else {
            state.k = Some(k);
            None
        }
    },
    /* 16 */
    |state, _| {
        let i = state.k.map_or(0, |i| i + 1);
        if i >= state.V {
            state.i = None;
            Some(15)
        } else {
            state.i = Some(i);
            None
        }
    },
    /* 17 */
    |state, _| {
        let j = state.k.map_or(0, |j| j + 1);
        if j >= state.V {
            state.j = None;
            Some(16)
        } else {
            state.j = Some(j);
            None
        }
    },
    /* 18 */
    |state, _| {
        let i = state.i.unwrap();
        let j = state.j.unwrap();
        let k = state.k.unwrap();
        let dist_ij = state.get_dist(i, j);
        let dist_ik = state.get_dist(i, k);
        let dist_kj = state.get_dist(k, j);
        if dist_ij > dist_ik + dist_kj {
            None
        } else {
            Some(17)
        }
    },
    /* 19 */
    |state, _| {
        let i = state.i.unwrap();
        let j = state.j.unwrap();
        let k = state.k.unwrap();
        let new_distance = state.get_dist(i, k) + state.get_dist(k, j);
        state.update_dist(i, j, new_distance);
        None
    },
    /* 20 */
    |state, _| {
        let i = state.i.unwrap();
        let j = state.j.unwrap();
        let k = state.k.unwrap();
        let new_next = state.get_next(k, j);
        state.update_next(i, j, new_next);
        Some(17)
    },
    /* 21 */ |_, _| None,
    /* 22 */ |state, _| {
        state.is_done = true;
        None
    },
];
