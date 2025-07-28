import * as util from "./util.ts";

export type Fill = ForwardFill | StaticFill;
export enum FillType {
  Forward = "forward",
  Static = "static",
}

/** Fill using the last seen, non-empty value. */
export type ForwardFill = {
  type: FillType.Forward;
};

/** Fill using a static value. */
export type StaticFill = {
  type: FillType.Static;
  value: string;
};

/**
 * Fill empty cells.
 *
 * # Examples
 *
 * ```handle
 * csv-util/fill(
 *     file = @file("sample.csv"),
 *     fill = /Static(value = "<empty>"),
 * )
 * ```
 */
export async function fill(
  file: File,
  fill: Fill,
  /**
   * Specify the column(s) to fill (`0,4`, `0:4`, `name,age,height`, `prefix_*`,
   * etc) - defaults to all columns.
   */
  columns?: string,
): Promise<File> {
  const outputPath = util.outputPath(file.name, { suffix: "-filled" });
  const args = ["fill", util.inputPath(file.name), "--output", outputPath];
  if (columns) args.push("--select", columns);
  switch (fill.type) {
    case FillType.Static:
      args.push("--value", fill.value);
      break;
  }

  const output = await util.runXan(args, { input: file });
  return output.readFile(outputPath);
}
