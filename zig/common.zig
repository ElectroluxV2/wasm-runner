const std = @import("std");

pub const HexState = enum(u8) {
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

pub const MapState = packed struct {
  width: u32,
  height: u32,
  hexState: [*]HexState,
};


pub fn generateMap(allocator: std.mem.Allocator,  width: u32, height: u32) *MapState {
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

pub fn modifyMap(state: *MapState) *MapState {
  const numHexes = state.width * state.height;

  for (0..numHexes) |i| {
    state.hexState[i] = @enumFromInt((@intFromEnum(state.hexState[i]) + 1) % @intFromEnum(HexState.tree));
  }

  return state;
}

pub fn canSpawnUnit(state: *MapState, hexIndex: u32) bool {
  return state.hexState[hexIndex] == HexState.empty;
}
