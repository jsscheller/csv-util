import * as util from "./util.ts";

export type Sort = AlphabeticSort | NumericSort | RandomSort;
export const enum SortType {
  Alphabetic = "alphabetic",
  Numeric = "numeric",
  Random = "random",
}

/** Sort rows in alphabetic order. */
export type AlphabeticSort = {
  type: SortType.Alphabetic;
  /** Select the column(s) to use when sorting (`1,4`, `1-4`, `/^a/i`, etc). */
  sortColumns?: string;
  /**
   * Rows are in ascending order (A to Z) by default, set to `true` for
   * descending order (Z to A).
   */
  reverse?: boolean;
};

/** Sort rows in numeric order. */
export type NumericSort = {
  type: SortType.Numeric;
  /** Select the column(s) to use when sorting (`1,4`, `1-4`, `/^a/i`, etc). */
  sortColumns?: string;
  /**
   * Rows are in ascending order (1 to 9) by default, set to `true` for
   * descending order (9 to 1).
   */
  reverse?: boolean;
};

/** Sort rows in random order. */
export type RandomSort = {
  type: SortType.Random;
};

/**
 * Sort the rows in a CSV.
 *
 * # Examples
 *
 * ```handle
 * csv-util/sort(
 *     file = @file("ice-cream.csv"),
 *     sort = /Alphabetic(reverse = true)
 * )
 * ```
 */
export async function sort(file: File, sort: Sort): Promise<File> {
  const outputPath = util.outputPath(file.name, { suffix: "-sorted" });
  const args = ["sort", util.inputPath(file.name), "--output", outputPath];
  switch (sort.type) {
    case SortType.Alphabetic:
    case SortType.Numeric:
      if (sort.sortColumns) {
        args.push("--select", sort.sortColumns);
      }
      if (sort.reverse) {
        args.push("--reverse");
      }
      if (sort.type === SortType.Numeric) {
        args.push("--numeric");
      }
      break;
    case SortType.Random:
      args[0] = "shuffle";
      break;
  }

  const output = await util.runXan(args, { input: file });
  return output.readFile(outputPath);
}
