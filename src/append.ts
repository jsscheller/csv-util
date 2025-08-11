import * as util from "./util.ts";

export type Append = ColumnAppend | RowAppend;
export enum AppendType {
  Column = "column",
  Row = "row",
}

/**
 * Join by columns - making the resulting file "wider". The number of rows in
 * the output is the maximum number of rows across all input files.
 */
export type ColumnAppend = {
  type: AppendType.Column;
  /**
   * Use this option to truncate the resulting rows to the minimum number of
   * rows across all input files.
   */
  truncate?: boolean;
};

/**
 * Join by rows - making the resulting file "taller". The order of columns/rows
 * in the result depends on the order of the input files. All input files must
 * have the same number of columns.
 */
export type RowAppend = {
  type: AppendType.Row;
  /** Use this option if your input files do not have headers. */
  noHeaders?: boolean;
};

/**
 * Append CSV files by row or column.
 *
 * # Examples
 *
 * Combine two CSVs by appending columns.
 *
 * ```handle
 * csv-util/append(
 *     files = [@file("inventory.csv"), @file("suppliers.csv")],
 *     append = /Column,
 * )
 * ```
 *
 * Combine two CSVs by appending rows.
 *
 * ```handle
 * csv-util/append(
 *     files = [@file("inventory.csv"), @file("inventory-more.csv")],
 *     append = /Row,
 * )
 * ```
 */
export async function append(files: File[], append: Append): Promise<File> {
  if (files.length === 0) throw "expected at least one file";

  let args = ["cat"];
  switch (append.type) {
    case AppendType.Column:
      args.push("columns");
      if (!append.truncate) args.push("--pad");
      break;
    case AppendType.Row:
      args.push("rows");
      if (append.noHeaders) args.push("--no-headers");
      break;
  }
  const outputPath = util.outputPath(files[0]!.name, { suffix: "-append" });
  args.push("--output", outputPath);
  args = args.concat(files.map((x) => util.inputPath(x.name)));

  const output = await util.runXan(args, { input: files });
  return output.readFile(outputPath);
}
