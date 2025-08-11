import * as util from "./util.ts";

/**
 * Update a CSV so each row has the same number of columns.
 *
 * # Examples
 *
 * ```handle
 * csv-util/fix(file = @file("ingredients.csv"))
 * ```
 */
export async function fix(
  file: File,
  /**
   * The column count of the longest row is used by default. Use this option to
   * force the number of columns.
   */
  forceColumnCount?: number,
): Promise<File> {
  const outputPath = util.outputPath(file.name, { suffix: "-fix" });
  const output = await util.runXan(
    [
      "fixlengths",
      util.inputPath(file.name),
      "--output",
      outputPath,
      ...(forceColumnCount ? ["--length", forceColumnCount.toString()] : []),
    ],
    { input: file },
  );
  return output.readFile(outputPath);
}
