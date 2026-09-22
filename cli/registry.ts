import { readFile } from "node:fs/promises";
import path from "node:path";

export type Piece = {
  name: string;
  files: string[];
  depends: string[];
};

export type Registry = {
  name: string;
  root: string;
  destination: string;
  pieces: Piece[];
};

type RawPiece = {
  name: string;
  files?: string[];
  depends?: string[];
};

type RawRegistry = {
  name: string;
  root: string;
  destination: string;
  pieces: RawPiece[];
};

export const loadRegistry = async (registryPath: string): Promise<Registry> => {
  const raw = JSON.parse(await readFile(registryPath, "utf8")) as RawRegistry;
  return {
    name: raw.name,
    root: raw.root,
    destination: raw.destination,
    pieces: raw.pieces.map((piece) => ({
      name: piece.name,
      files: piece.files ?? [],
      depends: piece.depends ?? [],
    })),
  };
};

export const resolvePieceNames = (
  registry: Registry,
  name: string,
): string[] => {
  const pieces = new Map(registry.pieces.map((piece) => [piece.name, piece]));
  const requested = pieces.get(name);
  if (!requested) {
    throw new Error(`Unknown piece "${name}".`);
  }

  const ordered: string[] = [];
  const seen = new Set<string>();
  const visit = (pieceName: string) => {
    if (seen.has(pieceName)) return;
    const piece = pieces.get(pieceName);
    if (!piece) {
      throw new Error(`Unknown dependency "${pieceName}".`);
    }
    seen.add(pieceName);
    for (const dependency of piece.depends) {
      visit(dependency);
    }
    ordered.push(pieceName);
  };

  visit(name);
  return ordered;
};

export const filesForPieces = (
  registry: Registry,
  names: readonly string[],
): string[] => {
  const pieces = new Map(registry.pieces.map((piece) => [piece.name, piece]));
  const files: string[] = [];
  const seen = new Set<string>();

  for (const name of names) {
    const piece = pieces.get(name);
    if (!piece) {
      throw new Error(`Unknown piece "${name}".`);
    }
    for (const file of piece.files) {
      if (seen.has(file)) continue;
      seen.add(file);
      files.push(file);
    }
  }

  return files;
};

export const sourceRoot = (repoRoot: string, registry: Registry): string =>
  path.join(repoRoot, registry.root);
