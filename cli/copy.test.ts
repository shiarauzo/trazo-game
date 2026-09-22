import { afterEach, expect, test } from "bun:test";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { copyFiles, isGodotProject } from "./copy";
import { filesForPieces, loadRegistry, resolvePieceNames } from "./registry";

const temps: string[] = [];

afterEach(async () => {
  await Promise.all(temps.map((dir) => rm(dir, { recursive: true, force: true })));
  temps.length = 0;
});

const makeTemp = async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "trazo-"));
  temps.push(dir);
  return dir;
};

test("init requires a Godot project", async () => {
  const dir = await makeTemp();
  expect(await isGodotProject(dir)).toBe(false);
  await writeFile(path.join(dir, "project.godot"), "config_version=5\n");
  expect(await isGodotProject(dir)).toBe(true);
});

test("base resolves owned files once", async () => {
  const registry = await loadRegistry(
    path.resolve(import.meta.dir, "../registry.json"),
  );
  const names = resolvePieceNames(registry, "base");
  expect(names[0]).toBe("tokens");
  expect(filesForPieces(registry, names)).toEqual([
    "theme.tres",
    "focus_scope.gd",
    "sheet.tscn",
    "sheet.gd",
    "prompt.tscn",
    "prompt.gd",
    "selectable_list.gd",
  ]);
});

test("copy skips existing files unless forced", async () => {
  const dir = await makeTemp();
  const source = path.join(dir, "source");
  const destination = path.join(dir, "ui");
  await mkdir(source, { recursive: true });
  await writeFile(path.join(source, "theme.tres"), "first\n");
  await mkdir(destination, { recursive: true });
  await writeFile(path.join(destination, "theme.tres"), "owned\n");

  const skipped = await copyFiles({
    sourceRoot: source,
    destinationRoot: destination,
    files: ["theme.tres"],
    force: false,
  });
  expect(skipped.skipped).toEqual(["theme.tres"]);
  expect(await readFile(path.join(destination, "theme.tres"), "utf8")).toBe(
    "owned\n",
  );

  const forced = await copyFiles({
    sourceRoot: source,
    destinationRoot: destination,
    files: ["theme.tres"],
    force: true,
  });
  expect(forced.copied).toEqual(["theme.tres"]);
  expect(await readFile(path.join(destination, "theme.tres"), "utf8")).toBe(
    "first\n",
  );
});
