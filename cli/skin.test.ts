import { expect, test } from "bun:test";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  applySkinFile,
  loadSkin,
  renderTheme,
  stylesFor,
  type Skin,
} from "./skin";

const skin: Skin = {
  radius: 0,
  border: 3,
  focusBorder: 6,
  shadow: { x: 6, y: 6, size: 4 },
  ink: "#111111",
  paper: "#f4f1ea",
  fill: "#d0d0d0",
  accent: "#ff4fa3",
  danger: "#c43b3b",
  surface: "#fffdf8",
  muted: "#5c574e",
};

test("fill and the panel share the skin radius, border, and shadow", () => {
  const styles = stylesFor(skin);

  expect(styles.fill.normal).toMatchObject({
    radius: 0,
    border: 3,
    borderColor: "#111111",
    background: "#d0d0d0",
    backgroundAlpha: 1,
    shadowX: 6,
    shadowY: 6,
  });
  expect(styles.fill.normal.shadowSize).toBeGreaterThan(0);
  expect(styles.fill.hover.background).toBe("#c0c0c0");
  expect(styles.fill.hover.shadowX).toBe(6);
  expect(styles.fill.focus).toMatchObject({
    background: "#d0d0d0",
    borderColor: "#ff4fa3",
    shadowX: 6,
    shadowY: 6,
  });
  expect(styles.panel).toMatchObject({
    radius: 0,
    border: 3,
    borderColor: "#111111",
    background: "#fffdf8",
    shadowX: 6,
    shadowY: 6,
    shadowSize: styles.fill.normal.shadowSize,
  });
});

test("ghost stays an outline when focused", () => {
  const styles = stylesFor(skin);

  expect(styles.ghost.normal).toMatchObject({
    radius: 0,
    border: 3,
    borderColor: "#111111",
    backgroundAlpha: 0,
    shadowSize: 0,
    shadowX: 0,
    shadowY: 0,
  });
  expect(styles.ghost.focus).toMatchObject({
    backgroundAlpha: 0,
    border: 6,
    borderColor: "#ff4fa3",
    shadowSize: 0,
  });
  expect(styles.ghost.hover.backgroundAlpha).toBe(0);
  expect(styles.ghost.hover.shadowSize).toBe(0);
});

test("danger keeps the fill geometry and its own color", () => {
  const styles = stylesFor(skin);

  expect(styles.danger.normal).toMatchObject({
    radius: 0,
    border: 3,
    background: "#c43b3b",
    backgroundAlpha: 1,
    shadowX: 6,
    shadowY: 6,
    shadowSize: styles.fill.normal.shadowSize,
  });
  expect(styles.danger.focus).toMatchObject({
    background: "#c43b3b",
    border: 6,
    borderColor: "#ff4fa3",
    shadowX: 6,
  });
  expect(styles.danger.hover.background).toBe("#b42b2b");
});

test("text has no border and no shadow", () => {
  const styles = stylesFor(skin);

  expect(styles.text).toEqual({
    color: "#111111",
    border: 0,
    shadowSize: 0,
  });
});

const block = (theme: string, id: string): string => {
  const match = theme.match(
    new RegExp(`\\[sub_resource type="StyleBoxFlat" id="${id}"\\][\\s\\S]*?(?=\\n\\[|$)`),
  );
  if (!match) {
    throw new Error(`Missing style ${id}`);
  }
  return match[0];
};

test("the theme file keeps the ghost focus outline and the fill shadow", () => {
  const theme = renderTheme(skin);
  const ghostFocus = block(theme, "ghost_focus");
  expect(ghostFocus).toContain("bg_color = Color(0, 0, 0, 0)");
  expect(ghostFocus).toContain("border_color = Color(1, 0.309804, 0.639216, 1)");
  expect(ghostFocus).toContain("border_width_left = 6");
  expect(ghostFocus).toContain("shadow_size = 0");

  const fillNormal = block(theme, "fill_normal");
  expect(fillNormal).toContain("bg_color = Color(0.815686, 0.815686, 0.815686, 1)");
  expect(fillNormal).toContain("shadow_offset = Vector2(6, 6)");
  expect(fillNormal).toContain("shadow_size = 4");
  expect(fillNormal).toContain("corner_radius_top_left = 0");
  expect(fillNormal).toContain("border_width_left = 3");
  expect(theme).toContain(
    "Button/colors/font_color = Color(0.066667, 0.066667, 0.066667, 1)",
  );
  expect(theme).toContain(
    "trazo/colors/text = Color(0.066667, 0.066667, 0.066667, 1)",
  );
  expect(theme).toContain('default_font = ExtResource("1_font")');
  expect(block(theme, "fill_focus")).toContain("border_width_left = 6");
});

test("the host skin stays sharp and shared", async () => {
  const hostSkin = await loadSkin(path.resolve(import.meta.dir, "../skin.json"));
  const styles = stylesFor(hostSkin);

  expect(hostSkin.radius).toBe(0);
  expect(styles.fill.normal.border).toBe(styles.panel.border);
  expect(styles.fill.normal.shadowX).toBe(styles.panel.shadowX);
  expect(styles.fill.normal.shadowY).toBe(styles.panel.shadowY);
  expect(styles.fill.focus.border).toBeGreaterThan(styles.fill.normal.border);
  expect(styles.ghost.focus.border).toBe(hostSkin.focusBorder);
  expect(styles.fill.normal.shadowSize).toBe(hostSkin.shadow.size);
  expect(styles.ghost.focus.backgroundAlpha).toBe(0);
  expect(styles.ghost.focus.shadowSize).toBe(0);
});

test("apply writes the theme from a skin file", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "trazo-skin-"));
  try {
    const skinPath = path.join(dir, "skin.json");
    const themePath = path.join(dir, "theme.tres");
    await writeFile(skinPath, `${JSON.stringify(skin, null, 2)}\n`);
    await applySkinFile(skinPath, themePath);
    const written = await readFile(themePath, "utf8");
    expect(block(written, "ghost_focus")).toContain("bg_color = Color(0, 0, 0, 0)");
    expect(block(written, "fill_normal")).toContain("shadow_offset = Vector2(6, 6)");
    expect(written).toContain('ghost/styles/focus = SubResource("ghost_focus")');
    expect(written).toContain('PanelContainer/styles/panel = SubResource("panel")');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
