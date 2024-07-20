const std = @import("std");
const common = @import("common.zig");

const allocator = std.heap.wasm_allocator;

export fn add(a: u64, b: u64) u64 {
  return a + b;
}

export fn generateMap(width: u32, height: u32) *common.MapState {
  return common.generateMap(allocator, width, height);
}

export fn modifyMap(state: *common.MapState) *common.MapState {
  return common.modifyMap(state);
}

export fn canSpawnUnit(state: *common.MapState, hexIndex: u32) bool {
  return common.canSpawnUnit(state, hexIndex);
}
