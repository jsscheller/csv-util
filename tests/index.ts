import { test } from "uvu";
import * as assert from "uvu/assert";
import * as csvUtil from "../src/index.ts";

test("frequency", async function () {
  const input = await download("ice-cream.csv");
  await csvUtil.frequency(input);
});

test("behead", async function () {
  const input = await download("ice-cream.csv");
  await csvUtil.behead(input);
});

test("count", async function () {
  const input = await download("ice-cream.csv");
  const output = await csvUtil.count(input);
  assert.equal(output, 12);
});

test("dedup", async function () {
  const input = await download("ice-cream.csv");
  await csvUtil.dedup(input);
});

test("dedup - select", async function () {
  const input = await download("inventory.csv");
  await csvUtil.dedup(input, "Category,Price");
});

test("dedup - keep last", async function () {
  const input = await download("inventory.csv");
  await csvUtil.dedup(input, undefined, true);
});

test("dedup - keep duplicates", async function () {
  const input = await download("inventory.csv");
  await csvUtil.dedup(input, undefined, undefined, true);
});

test("fill", async function () {
  const input = await download("prices.csv");
  await csvUtil.fill(input, {
    type: csvUtil.FillType.Static,
    value: "0.00",
  });
});

test("fill - forward", async function () {
  const input = await download("prices.csv");
  await csvUtil.fill(input, {
    type: csvUtil.FillType.Forward,
  });
});

test("append - row", async function () {
  const first = await download("inventory.csv");
  const second = await download("inventory-more.csv");
  await csvUtil.append([first, second], { type: csvUtil.AppendType.Row });
});

test("append - column", async function () {
  const first = await download("inventory.csv");
  const second = await download("suppliers.csv");
  await csvUtil.append([first, second], { type: csvUtil.AppendType.Column });
});

test("fix", async function () {
  const input = await download("ingredients.csv");
  await csvUtil.fix(input);
});

test("sort", async function () {
  const input = await download("ice-cream.csv");
  await csvUtil.sort(input, { type: csvUtil.SortType.Alphabetic });
});

test("split chunk", async function () {
  const input = await download("ice-cream.csv");
  const output = await csvUtil.split(input, {
    type: csvUtil.SplitType.Chunk,
    value: 3,
  });
  assert.equal(output.length, 3);
});

test("split size", async function () {
  const input = await download("ice-cream.csv");
  const output = await csvUtil.split(input, {
    type: csvUtil.SplitType.Size,
    value: 4,
  });
  assert.equal(output.length, 3);
});

async function download(asset: string): Promise<File> {
  const blob = await fetch(`/assets/${asset}`).then((x) => x.blob());
  return new File([blob], asset, { type: blob.type });
}

test.run();
