import { test } from "uvu";
import * as assert from "uvu/assert";
import * as csvUtil from "../src/index.ts";

test("frequency", async function () {
  const input = await download("sample.csv");
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
  const input = await download("sample.csv");
  await csvUtil.dedup(input);
});

test("fill", async function () {
  const input = await download("sample.csv");
  await csvUtil.fill(input, {
    type: csvUtil.FillType.Static,
    value: "<empty>",
  });
});

test("merge", async function () {
  const first = await download("sample.csv");
  const second = await download("sample-edit.csv");
  await csvUtil.merge([first, second], { type: csvUtil.MergeType.Row });
});

test("pad", async function () {
  const input = await download("ice-cream.csv");
  await csvUtil.pad(input);
});

test("sort", async function () {
  const input = await download("sample.csv");
  await csvUtil.sort(input, { type: csvUtil.SortType.Alphabetic });
});

async function download(asset: string): Promise<File> {
  const blob = await fetch(`/assets/${asset}`).then((x) => x.blob());
  return new File([blob], asset, { type: blob.type });
}

test.run();
