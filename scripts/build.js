import * as path from "path";
import * as fs from "fs/promises";
import esbuild from "esbuild";
import { run } from "runish";

const OUT_DIR = path.resolve("./out");
const RELEASE_DIR = path.join(OUT_DIR, "release");
const { RELEASE } = process.env;

async function main() {
  if (RELEASE) await fs.rm(OUT_DIR, { force: true, recursive: true });
  await fs.mkdir(OUT_DIR, { recursive: true });

  for (const jsPath of ["node_modules/xan-wasm/xan.js"]) {
    await fs.cp(
      jsPath,
      path.join(OUT_DIR, path.basename(jsPath, ".js") + ".wasm.js"),
    );
  }

  await run("node_modules/typescript/bin/tsc", ["--noEmit"]);

  await esbuild.build({
    entryPoints: ["src/index.ts", ...(RELEASE ? [] : ["tests/index.ts"])],
    outdir: OUT_DIR,
    bundle: true,
    write: true,
    format: "esm",
    target: "es2020",
    loader: { ".wasm": "file", ".worker.js": "file", ".wasm.js": "file" },
    minify: !!RELEASE,
  });

  if (!RELEASE) return;

  await fs.rm(RELEASE_DIR, { force: true, recursive: true });
  await fs.mkdir(RELEASE_DIR, { recursive: true });

  const files = ["out/xan-*.wasm", "out/xan.wasm-*.js", "out/index.js"];
  for (const glob of files) {
    for await (const filePath of fs.glob(glob)) {
      await fs.cp(filePath, path.join(RELEASE_DIR, path.basename(filePath)), {
        recursive: true,
      });
    }
  }

  await fs.cp("assets", RELEASE_DIR, { recursive: true });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
