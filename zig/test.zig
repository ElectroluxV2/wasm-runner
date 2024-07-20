const std = @import("std");
const common = @import("common.zig");

var gpa = std.heap.GeneralPurposeAllocator(.{}){};
const allocator = gpa.allocator();

test "canSpawnHouse - place on empty hex" {
  var map = allocator.create(common.MapState) catch unreachable;
  const hexStates = allocator.alloc(common.HexState, 1) catch unreachable;
  hexStates[0] = common.HexState.empty;

  map.hexState = hexStates.ptr;

  const result = common.canSpawnUnit(map, 0);

  try std.testing.expect(result == true);
}

test "canSpawnHouse - place on tree hex" {
  var map = allocator.create(common.MapState) catch unreachable;
  const hexStates = allocator.alloc(common.HexState, 1) catch unreachable;
  hexStates[0] = common.HexState.tree;

  map.hexState = hexStates.ptr;

  const result = common.canSpawnUnit(map, 0);

  try std.testing.expect(result == true);
}
