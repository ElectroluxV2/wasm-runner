const std = @import("std");

export fn add(a: u64, b: u64) u64 {
  return a + b;
}

const HexState = enum(u8) {
  water,
  empty,
  castle,
  house,
  watchtower,
  keeptower,
  peasantReady,
  spearmanReady,
  mercenaryReady,
  knightReady,
  peasantBreak,
  spearmanBreak,
  mercenaryBreak,
  knightBreak,
  calvary,
  tree
};

const MapState = packed struct {
  width: u32,
  height: u32,
  hexState: [*]HexState,
};

const allocator = std.heap.wasm_allocator;

export fn generateMap(width: u32, height: u32) *MapState {
  var state = allocator.create(MapState) catch unreachable;
  const hexStates = allocator.alloc(HexState, width * height) catch unreachable;

  for (hexStates) |*hexState| {
    hexState.* = HexState.house;
  }

  state.width = width;
  state.height = height;
  state.hexState = hexStates.ptr;

  return state;
}

export fn modifyMap(state: *MapState) *MapState {
  const numHexes = state.width * state.height;

  for (0..numHexes) |i| {
    state.hexState[i] = @enumFromInt(@intFromEnum(state.hexState[i]) + 1 % @intFromEnum(HexState.tree));
  }

  return state;
}
