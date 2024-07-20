#pragma warning disable CA2208
// ReSharper disable ConvertToLocalFunction
using Wasmtime;

using i64 = long;
using i32 = int;
using u8 = byte;

using var engine = new Engine();

using var module = Module.FromFile(engine, "../../../../zig/zig-out/bin/test.wasm");

using var linker = new Linker(engine);
using var store = new Store(engine);

var instance = linker.Instantiate(store, module);

var add = instance.GetFunction<i64, i64, i64>("add");
if (add is null) throw new ArgumentNullException(nameof(add));
Console.WriteLine("add(32, 45) = {0}", add!(32, 45));

var generateMap = instance.GetFunction<i32, i32, i32>("generateMap");
if (generateMap is null) throw new ArgumentNullException(nameof(generateMap));
var generatedMapPtr = generateMap(2, 3);
Console.Out.WriteLine("generateMap(2, 3) = {0}", generatedMapPtr);

var memory = instance.GetMemory("memory");
if (memory is null) throw new ArgumentNullException(nameof(memory));

var readMapState = (i32 mapStatePtr) =>
{
    var width = memory.ReadInt32(mapStatePtr);
    Console.Out.WriteLine("width = {0}", width);
    var height = memory.ReadInt32(mapStatePtr + sizeof(i32));
    Console.Out.WriteLine("height = {0}", height);

    var hexStatePtr = memory.ReadInt32(mapStatePtr + 2 * sizeof(i32));
    var hexState = memory.GetSpan<u8>(hexStatePtr, width * height);
    Console.Out.WriteLine("hexState = [{0}]", string.Join(", ", hexState.ToArray()));
};

readMapState(generatedMapPtr);

var modifyMap = instance.GetFunction<i32, i32>("modifyMap");
if (modifyMap is null) throw new ArgumentNullException(nameof(modifyMap));

for (int i = 0; i < 20; i++)
{
    modifyMap(generatedMapPtr);
    readMapState(generatedMapPtr);
}
