import * as util from "./util.ts";

export type Split = SizeSplit | ChunkSplit;
export enum SplitType {
  Size = "size",
  Chunk = "chunk",
}

/** Split into chunks with each chunk containing the specified number of records. */
export type SizeSplit = {
  type: SplitType.Size;
  value: number;
};

/** Split into the specified number of chunks. */
export type ChunkSplit = {
  type: SplitType.Chunk;
  value: number;
};

/**
 * Split a CSV into smaller CSVs.
 *
 * # Examples
 *
 * ```handle
 * csv-util/split(file = @file("ice-cream.csv"), split = /Chunk(3))
 * ```
 */
export async function split(file: File, split: Split): Promise<File[]> {
  let args;
  switch (split.type) {
    case SplitType.Size:
      args = ["--size", split.value.toString()];
      break;
    case SplitType.Chunk:
      args = ["--chunks", split.value.toString()];
      break;
  }

  const outputPath = util.outputPath(file.name, { suffix: "-{}" });
  const [outDir, filename] = outputPath.slice(1).split("/");
  const output = await util.runXan(
    [
      "split",
      util.inputPath(file.name),
      ...args,
      "--out-dir",
      outDir,
      "--filename",
      filename,
    ],
    { input: file },
  );

  return output
    .readDir("/output")
    .filter((x) => !x.startsWith("."))
    .map((x) => output.readFile(util.outputPath(x)));
}
