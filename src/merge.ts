import * as util from "./util.ts";

export type Merge = ColumnMerge | RowMerge;
export enum MergeType {
  Column = "column",
  Row = "row",
}

/**
 * Join by columns - making the resulting file "wider". The number of rows in
 * the output is the maximum number of rows across all input files
 */
export type ColumnMerge = {
  type: MergeType.Column;
  /**
   * Use this option to truncate the resulting rows to the minimum number of
   * rows across all input files.
   */
  truncate?: boolean;
};

/**
 * Join by rows - making the resulting file "taller". The order of columns/rows
 * in the result depends on the order of the input files.
 */
export type RowMerge = {
  type: MergeType.Row;
  /**
   * Use this option if your input files do not have headers. Enabling this
   * option requires all input files have the same number of columns.
   */
  noHeaders?: boolean;
};

/**
 * Merge CSV files by row or column.
 *
 * # Examples
 *
 * ```handle
 * csv-util/merge(
 *     files = [@file("sample.csv"), @file("sample-edit.csv")],
 *     merge = /Row,
 * )
 * ```
 */
export async function merge(files: File[], merge: Merge): Promise<File> {
  if (files.length === 0) throw "expected at least one file";

  let args = ["cat"];
  switch (merge.type) {
    case MergeType.Column:
      args.push("columns");
      if (!merge.truncate) args.push("--pad");
      break;
    case MergeType.Row:
      args.push("rows");
      if (merge.noHeaders) args.push("--no-headers");
      break;
  }
  const outputPath = util.outputPath(files[0]!.name, { suffix: "-merged" });
  args.push("--output", outputPath);
  args = args.concat(files.map((x) => util.inputPath(x.name)));

  const output = await util.runXan(args, { input: files });
  return output.readFile(outputPath);
}
