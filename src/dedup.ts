import * as util from "./util.ts";

/**
 * Remove deduplicate rows from a CSV file.
 *
 * # Examples
 *
 * ```handle
 * csv-util/dedup(file = @file("sample.csv"))
 * ```
 */
export async function dedup(file: File): Promise<File> {
  const outputPath = util.outputPath(file.name, { suffix: "-dedup" });
  const output = await util.runXan(
    [
      "dedup",
      util.inputPath(file.name),
      // Use disk-backed index to prevent overflowing RAM.
      ...(file.size > 1e9 ? ["--external"] : []),
      "--output",
      outputPath,
    ],
    { input: file },
  );
  return output.readFile(outputPath);
}
