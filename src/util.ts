import xanJsUrl from "out/xan.wasm.js";
import xanWasmUrl from "xan-wasm/xan.wasm";

let initXanModule: any;

export type RunOptions = {
  stderr?: boolean;
  stdout?: boolean;
  input?: File | File[] | { name: string; data: Blob }[];
  output?: string | string[];
};

export async function runXan(
  args: string[],
  opts: RunOptions = {},
): Promise<RunOutput> {
  const xan = await initXan(opts);
  xan.callMain(args);
  return new RunOutput(xan);
}

async function initXan(opts: RunOptions = {}): Promise<any> {
  const jsUrl = new URL(xanJsUrl, import.meta.url).href;
  if (!initXanModule) {
    const imports = await import(jsUrl);
    initXanModule = imports.default;
  }
  const xan = await initXanModule({
    noFSInit: !!(opts.stdout || opts.stderr),
    locateFile: (url: string) => {
      return url.endsWith(".wasm")
        ? new URL(xanWasmUrl, import.meta.url).href
        : jsUrl;
    },
  });
  initModule(xan, opts);
  return xan;
}

function initModule(mod: any, opts: RunOptions) {
  mod.__stdout__ = "";
  mod.__stderr__ = "";
  if (opts.stderr || opts.stdout) {
    const stderr = opts.stderr
      ? new LineOut((x) => (mod.__stderr__ += x))
      : undefined;
    const stdout = opts.stdout
      ? new LineOut((x) => (mod.__stdout__ += x))
      : undefined;
    mod.FS.init(
      undefined,
      stdout ? (x: number) => stdout.push(x) : undefined,
      stderr ? (x: number) => stderr.push(x) : undefined,
    );
  }
  mod.FS.mkdir("/input");
  if (opts.input) {
    if (!Array.isArray(opts.input)) opts.input = [opts.input];
    const mount = (opts.input[0] as any)?.data
      ? { blobs: opts.input }
      : { files: opts.input };
    mod.FS.mount(mod.WORKERFS, mount, "/input");
  }
  mod.FS.mkdir("/output");
}

class LineOut {
  len: number;
  buf: Uint8Array;
  textDec?: TextDecoder;

  constructor(public callback: (buf: string) => void) {
    this.len = 0;
    this.buf = new Uint8Array(256);
  }

  push(charCode: number) {
    if (this.buf.length === this.len) {
      this.buf = resizeBuffer(this.buf, this.len * 2);
    }
    this.buf[this.len] = charCode;

    if (charCode === 10) {
      if (!this.textDec) this.textDec = new TextDecoder();
      const s = this.textDec.decode(this.buf.subarray(0, this.len));
      this.callback(s);
      this.len = 0;
    } else {
      this.len += 1;
    }
  }
}

// Allocates a new backing store for the given node so that it can fit at least newSize amount of bytes.
// May allocate more, to provide automatic geometric increase and amortized linear performance appending writes.
// Never shrinks the storage.
function resizeBuffer(
  buf: Uint8Array,
  newCapacity: number,
  prevLen: number = buf.length,
): Uint8Array {
  const prevCapacity = buf ? buf.length : 0;
  if (prevCapacity >= newCapacity) {
    // No need to expand, the storage was already large enough.
    return buf;
  }
  // Don't expand strictly to the given requested limit if it's only a very small increase, but instead geometrically grow capacity.
  // For small filesizes (<1MB), perform size*2 geometric increase, but for large sizes, do a much more conservative size*1.125 increase to
  // avoid overshooting the allocation cap by a very large margin.
  const CAPACITY_DOUBLING_MAX = 1024 * 1024;
  newCapacity = Math.max(
    newCapacity,
    (prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2.0 : 1.125)) >>> 0,
  );
  if (prevCapacity !== 0) {
    // At minimum allocate 256b for each file when expanding.
    newCapacity = Math.max(newCapacity, 256);
  }
  const prevBuf = buf;
  buf = new Uint8Array(newCapacity);
  if (prevLen > 0) {
    // Copy old data over to the new storage.
    buf!.set(prevBuf!.subarray(0, prevLen));
  }
  return buf;
}

export class RunOutput {
  stderr: string;
  stdout: string;

  constructor(private mod: any) {
    this.stderr = mod.__stderr__;
    this.stdout = mod.__stdout__;
  }

  public readFile(path: string, mimeType: string = ""): File {
    const buf = this.mod.FS.readFile(path);
    const name = path.split("/").at(-1)!;
    return new File([buf], name, { type: mimeType });
  }
}

export function inputPath(path: string): string {
  const name = path.split("/").at(-1)!;
  return `/input/${name}`;
}

export function outputPath(
  path: string,
  opts: { ext?: string; suffix?: string } = {},
): string {
  let name = path.split("/").at(-1)!;
  if (opts.ext) {
    name = replaceExt(name, opts.ext);
  }
  if (opts.suffix) {
    name = addSuffix(name, opts.suffix);
  }
  return `/output/${name}`;
}

export function replaceExt(name: string, ext: string): string {
  let lastDot = name.lastIndexOf(".");
  if (lastDot === -1) {
    lastDot = name.length - 1;
    ext = "." + ext;
  }
  return name.slice(0, lastDot + 1) + ext;
}

export function addSuffix(name: string, suffix: string): string {
  let stem = name;
  let ext = "";
  const lastDot = name.lastIndexOf(".");
  if (lastDot > -1) {
    stem = name.slice(0, lastDot);
    ext = name.slice(lastDot);
  }
  return `${stem}${suffix}${ext}`;
}
