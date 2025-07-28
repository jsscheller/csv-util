import * as util from "./util.ts";

/**
 * Calculate the frequency of data within each column of a CSV.
 *
 * # Examples
 *
 * ```handle
 * csv-util/frequency(file = @file("sample.csv"))
 * ```
 */
export async function frequency(
  file: File,
  /**
   * Specify the column(s) to select (`0,4`, `0:4`, `name,age,height`,
   * `prefix_*`, etc) - defaults to all columns.
   */
  columns?: string,
  /**
   * Limit the output to a fixed number of values per column.
   *
   * @default 10
   */
  limit?: number,
): Promise<File> {
  const outputPath = util.outputPath(file.name, { suffix: "-freq" });
  const output = await util.runXan(
    [
      "frequency",
      util.inputPath(file.name),
      "--output",
      outputPath,
      ...(columns ? ["--select", columns] : []),
      ...(limit ? ["--limit", limit.toString()] : []),
    ],
    { input: file },
  );
  return output.readFile(outputPath);
}
