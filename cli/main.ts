#!/usr/bin/env bun

import path from "node:path";
import { fileURLToPath } from "node:url";
import { copyFiles, isGodotProject } from "./copy";
import {
  filesForPieces,
  loadRegistry,
  resolvePieceNames,
  sourceRoot,
} from "./registry";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const usage = `Trazo — owned game UI for Godot

Usage:
  bun cli/main.ts list
  bun cli/main.ts init <godot-project>
  bun cli/main.ts add <piece> <godot-project> [--force]

Copied files belong to the project. Do not republish Trazo as a kit.`;

const fail = (message: string): never => {
  console.error(message);
  process.exit(1);
};

const parseArgs = (argv: string[]) => {
  const flags = new Set(argv.filter((arg) => arg.startsWith("--")));
  const rest = argv.filter((arg) => !arg.startsWith("--"));
  return { command: rest[0], args: rest.slice(1), force: flags.has("--force") };
};

const requireProject = async (projectPath: string) => {
  const resolved = path.resolve(projectPath);
  if (!(await isGodotProject(resolved))) {
    fail(`Not a Godot project: ${resolved}`);
  }
  return resolved;
};

const install = async (
  pieceName: string,
  projectPath: string,
  force: boolean,
) => {
  const registry = await loadRegistry(path.join(repoRoot, "registry.json"));
  let names: string[];
  try {
    names = resolvePieceNames(registry, pieceName);
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error));
  }
  const files = filesForPieces(registry, names);
  const project = await requireProject(projectPath);
  const result = await copyFiles({
    sourceRoot: sourceRoot(repoRoot, registry),
    destinationRoot: path.join(project, registry.destination),
    files,
    force,
  });

  if (result.copied.length > 0) {
    console.log(`Copied ${result.copied.join(", ")}`);
  }
  if (result.skipped.length > 0) {
    console.log(`Skipped existing ${result.skipped.join(", ")} (use --force)`);
  }
  if (result.copied.length === 0 && result.skipped.length === 0) {
    console.log(`Nothing to copy for ${pieceName}.`);
  }
};

const { command, args, force } = parseArgs(process.argv.slice(2));

switch (command) {
  case "list": {
    const registry = await loadRegistry(path.join(repoRoot, "registry.json"));
    for (const piece of registry.pieces) {
      const extra =
        piece.depends.length > 0 ? ` (needs ${piece.depends.join(", ")})` : "";
      console.log(`${piece.name}${extra}`);
    }
    break;
  }
  case "init": {
    const projectPath = args[0];
    if (!projectPath) fail(usage);
    await install("tokens", projectPath, force);
    break;
  }
  case "add": {
    const [pieceName, projectPath] = args;
    if (!pieceName || !projectPath) fail(usage);
    await install(pieceName, projectPath, force);
    break;
  }
  default:
    fail(usage);
}
