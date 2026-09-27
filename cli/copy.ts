import { access, copyFile, mkdir } from "node:fs/promises";
import path from "node:path";

export type CopyResult = {
  copied: string[];
  skipped: string[];
};

const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
};

export const isGodotProject = async (projectPath: string): Promise<boolean> =>
  fileExists(path.join(projectPath, "project.godot"));

export const copyFiles = async (options: {
  sourceRoot: string;
  destinationRoot: string;
  files: readonly string[];
  force: boolean;
}): Promise<CopyResult> => {
  const copied: string[] = [];
  const skipped: string[] = [];

  for (const file of options.files) {
    const from = path.join(options.sourceRoot, file);
    const to = path.join(options.destinationRoot, file);
    if (!(await fileExists(from))) {
      throw new Error(`Missing source file ${file}.`);
    }
    if (!options.force && (await fileExists(to))) {
      skipped.push(file);
      continue;
    }
    await mkdir(path.dirname(to), { recursive: true });
    await copyFile(from, to);
    copied.push(file);
  }

  return { copied, skipped };
};
