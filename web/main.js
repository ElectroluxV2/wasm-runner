import zigBuildOutput from '../zig/zig-out/bin/test.wasm?url';

const wasmFileInput /** @type HTMLInputElement */ = document.getElementById('wasmFileInput');
const statusSpan = document.getElementById('status');
const exportsListElement = document.getElementById('exportsList');

const setStatus = {
  noFileSelected: () => statusSpan.innerText = 'No file selected',
  /** @param bytesCount {number} */
  selectedFileSize: (bytesCount) => statusSpan.innerText = `WASM raw size: ${new Intl.NumberFormat("en-us").format(bytesCount / 1_000)} KB`,
  loadedWasm: () => statusSpan.innerText = 'WASM loaded',
}

wasmFileInput.onchange = async () => {
  if (!wasmFileInput.files.length) return setStatus.noFileSelected();

  const [ file ] = /** @type [File] */ wasmFileInput.files;
  setStatus.selectedFileSize(file.size);

  await loadWasm(file.stream());
};

// init
const zigBuild = await fetch(/** @type string */ zigBuildOutput);
await loadWasm(zigBuild.body);

/** @param stream {ReadableStream<Uint8Array>} */
async function loadWasm(stream) {
  const response = new Response(stream, {
    headers: { 'content-type': 'application/wasm' },
  });

  const webAssemblyInstantiated = await WebAssembly.instantiateStreaming(response);
  console.log('Loaded WASM', webAssemblyInstantiated);
  setStatus.loadedWasm();

  // Show exported members
  exportsListElement.innerHTML = '';

  for (const [name, exportedMember] of Object.entries(webAssemblyInstantiated.instance.exports)) {
    const section = document.createElement('section');
    const nameElement = document.createElement('code');
    nameElement.innerText = name;
    section.appendChild(nameElement);

    const logElement = document.createElement('button');
    logElement.innerText = 'log';
    logElement.onclick = () => {
      console.log(`T: ${typeof exportedMember}, N: ${name}`, exportedMember);
      if (name === 'memory') {
        inspectMemory(webAssemblyInstantiated.instance.exports.memory)
      }
    };
    section.appendChild(logElement);

    if (name === 'add') {
      const arg1 = document.createElement('input');
      arg1.type = 'number';
      arg1.placeholder = 'arg1';
      section.appendChild(arg1);

      const arg2 = document.createElement('input');
      arg2.type = 'number';
      arg2.placeholder = 'arg2';
      section.appendChild(arg2);

      const executeBtn = document.createElement('button');
      executeBtn.innerText = 'execute';
      section.appendChild(executeBtn);

      const resultSpan = document.createElement('span');
      section.appendChild(resultSpan);

      executeBtn.onclick = () => {
        const result = exportedMember(arg1.value, arg2.value);
        console.log(`Result of ${name}`, result);
        resultSpan.innerText = result;
      };
    } else if (name === 'generateMap') {
      const widthInput = document.createElement('input');
      widthInput.type = 'number';
      widthInput.placeholder = 'width';
      section.appendChild(widthInput);

      const heightInput = document.createElement('input');
      heightInput.type = 'number';
      heightInput.placeholder = 'height';
      section.appendChild(heightInput);

      const executeBtn = document.createElement('button');
      executeBtn.innerText = 'execute';
      section.appendChild(executeBtn);

      const resultSpan = document.createElement('span');
      section.appendChild(resultSpan);

      executeBtn.onclick = () => {
        const ptr = exportedMember(widthInput.value, heightInput.value);
        console.log('ptr', ptr)

        const structView = new DataView(webAssemblyInstantiated.instance.exports.memory.buffer, ptr, 3 * Uint32Array.BYTES_PER_ELEMENT);
        const width = structView.getUint32(0 * Uint32Array.BYTES_PER_ELEMENT, true);
        const height = structView.getUint32(1 * Uint32Array.BYTES_PER_ELEMENT, true);

        console.log('width', width);
        console.log('height', height);

        const hexStatePtr = structView.getUint32(2 * Uint32Array.BYTES_PER_ELEMENT, true);
        const hexState = new Uint8Array(webAssemblyInstantiated.instance.exports.memory.buffer, hexStatePtr, width * height);

        console.log('hexState', hexState);

        resultSpan.innerText = ptr;
      };
    } else if (name === 'modifyMap') {
      const statePtrInput = document.createElement('input');
      statePtrInput.type = 'number';
      statePtrInput.placeholder = 'state ptr';
      section.appendChild(statePtrInput);

      const executeBtn = document.createElement('button');
      executeBtn.innerText = 'execute';
      section.appendChild(executeBtn);

      executeBtn.onclick = () => {
        const ptr = exportedMember(statePtrInput.value);
        console.log('ptr', ptr)
      }
    }

    exportsListElement.appendChild(section);
  }
}

function inspectMemory(memory) {
  const pageSize = 2 ** 16;

  const memoryView = new Uint8Array(memory.buffer);
  const used = [];
  for (let i = 0; i < memoryView.length; i++) {
    if (memoryView[i]) {
      const start = i;

      while (true) {
        const maxLookForwardBytes = 300;
        const bytesLeft = memoryView.length - i;
        const lookForwardBytes = Math.min(maxLookForwardBytes, bytesLeft);
        const forwardView = new Uint8Array(memory.buffer, i, lookForwardBytes);
        if (forwardView.every((byte) => byte === 0)) break;

        i++;
      }

      used.push([start, i - start]);
    }
  }
  console.log(
    used.map(
      ([start, length]) =>
        `page:${Math.floor(start / pageSize)} offset:${start} bytes:${length}`
    ).join('\n'),
  );
}
