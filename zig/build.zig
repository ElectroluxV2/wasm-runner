const std = @import("std");
const builtin = @import("builtin");

pub fn build(b: *std.Build) void {
  const promotOptimize = b.standardOptimizeOption(.{});
  const promtTarget = b.standardTargetOptions(.{});

  const wasmProdTarget = b.resolveTargetQuery(.{
    .cpu_arch = .wasm32,
    .os_tag = .freestanding,
  });

  const wasmProdOptimize = .ReleaseFast;

  const release = b.option(bool, "release", "Release WASM for production") orelse false;

  const exe = b.addExecutable(.{
    .name = "test",
    .root_source_file = b.path("test.zig"),
    .target = if (release) wasmProdTarget else promtTarget,
    .optimize = if (release) wasmProdOptimize else promotOptimize,
  });

  exe.rdynamic = true; // Export symbols
  exe.entry = .disabled; // Pure functions library

  b.installArtifact(exe);
}
