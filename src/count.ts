import * as util from "./util.ts";

/**
 * Count the number of records in a CSV file.
 *
 * # Examples
 *
 * ```handle
 * csv-util/count(file = @file("ice-cream.csv"))
 * ```
 */
export async function count(file: File): Promise<number> {
  const output = await util.runXan(["count", util.inputPath(file.name)], {
    stdout: true,
    input: file,
  });
  return parseInt(output.stdout);
}
