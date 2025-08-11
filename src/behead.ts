import * as util from "./util.ts";

/**
 * Remove the header from a CSV file.
 *
 * # Examples
 *
 * ```handle
 * csv-util/behead(file = @file("ice-cream.csv"))
 * ```
 */
export async function behead(file: File): Promise<File> {
  const outputPath = util.outputPath(file.name, { suffix: "-headless" });
  const output = await util.runXan(
    ["behead", util.inputPath(file.name), "--output", outputPath],
    { input: file },
  );
  return output.readFile(outputPath);
}
