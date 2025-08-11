import * as util from "./util.ts";

/**
 * Remove deduplicate rows from a CSV file.
 *
 * # Examples
 *
 * Remove duplicate rows using the contents of the entire row to determine
 * deduplication.
 *
 * ```handle
 * csv-util/dedup(file = @file("inventory.csv"))
 * ```
 *
 * Remove duplicate rows using the contents of select columns to determine
 * deduplication.
 *
 * ```handle
 * csv-util/dedup(file = @file("inventory.csv"), columns = ["Category", "Price"])
 * ```
 *
 * Remove duplicate rows keeping the last row of the duplicates.
 *
 * ```handle
 * csv-util/dedup(file = @file("inventory.csv"), last = true)
 * ```
 *
 * List only the duplicate rows.
 *
 * ```handle
 * csv-util/dedup(file = @file("inventory.csv"), keep_duplicates = true)
 * ```
 */
export async function dedup(
  file: File,
  /**
   * Select the columns used to determine deduplication. All columns are used by
   * default.
   */
  /**
   * Specify the column(s) used to determine deduplication (`0,4`, `0:4`,
   * `name,age,height`, `prefix_*`, etc) - defaults to all columns.
   */
  columns?: string,
  /**
   * Keep the last of the set of duplicate rows instead of the first which is
   * the default.
   */
  keepLast?: boolean,
  /** Emit only the duplicate rows. */
  keepDuplicates?: boolean,
): Promise<File> {
  const args = ["dedup", util.inputPath(file.name)];
  // Use disk-backed index to prevent overflowing RAM.
  // Not compatible with `keepLast`.
  if (file.size > 1e9 && !keepLast) args.push("--external");
  if (columns) args.push("--select", columns);
  if (keepDuplicates) args.push("--keep-duplicates");
  const outputPath = util.outputPath(file.name, { suffix: "-dedup" });
  args.push("--output", outputPath);

  const output = await util.runXan(args, { input: file });
  return output.readFile(outputPath);
}
