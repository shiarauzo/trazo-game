import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type Skin = {
  radius: number;
  border: number;
  focusBorder: number;
  shadow: { x: number; y: number; size: number };
  ink: string;
  paper: string;
  fill: string;
  accent: string;
  danger: string;
  surface: string;
  muted: string;
};

export type StyleBox = {
  radius: number;
  border: number;
  borderColor: string;
  background: string;
  backgroundAlpha: number;
  shadowSize: number;
  shadowX: number;
  shadowY: number;
  shadowColor: string;
};

export type Treatment = {
  normal: StyleBox;
  hover: StyleBox;
  pressed: StyleBox;
  focus: StyleBox;
};

export type SkinStyles = {
  fill: Treatment;
  ghost: Treatment;
  danger: Treatment;
  panel: StyleBox;
  text: { color: string; border: number; shadowSize: number };
};

const HOVER_STEP = 16;
const PRESSED_STEP = 32;

const parseHex = (hex: string): { r: number; g: number; b: number } => {
  const match = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) {
    throw new Error(`Expected a #rrggbb color, got "${hex}".`);
  }
  const value = match[1] ?? "";
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
};

const darken = (hex: string, amount: number): string => {
  const { r, g, b } = parseHex(hex);
  const channel = (value: number) =>
    Math.max(0, value - amount).toString(16).padStart(2, "0");
  return `#${channel(r)}${channel(g)}${channel(b)}`;
};

const fillBox = (
  skin: Skin,
  background: string,
  borderColor: string,
  border = skin.border,
): StyleBox => ({
  radius: skin.radius,
  border,
  borderColor,
  background,
  backgroundAlpha: 1,
  shadowSize: skin.shadow.size,
  shadowX: skin.shadow.x,
  shadowY: skin.shadow.y,
  shadowColor: skin.ink,
});

const outlineBox = (
  skin: Skin,
  borderColor: string,
  border = skin.border,
): StyleBox => ({
  radius: skin.radius,
  border,
  borderColor,
  background: skin.ink,
  backgroundAlpha: 0,
  shadowSize: 0,
  shadowX: 0,
  shadowY: 0,
  shadowColor: skin.ink,
});

const treatment = (
  skin: Skin,
  background: string,
): Treatment => ({
  normal: fillBox(skin, background, skin.ink),
  hover: fillBox(skin, darken(background, HOVER_STEP), skin.ink),
  pressed: fillBox(skin, darken(background, PRESSED_STEP), skin.ink),
  focus: fillBox(skin, background, skin.accent, skin.focusBorder),
});

export const stylesFor = (skin: Skin): SkinStyles => ({
  fill: treatment(skin, skin.fill),
  ghost: {
    normal: outlineBox(skin, skin.ink),
    hover: outlineBox(skin, skin.accent),
    pressed: outlineBox(skin, skin.accent),
    focus: outlineBox(skin, skin.accent, skin.focusBorder),
  },
  danger: treatment(skin, skin.danger),
  panel: fillBox(skin, skin.surface, skin.ink),
  text: { color: skin.ink, border: 0, shadowSize: 0 },
});

const formatChannel = (byte: number): string => {
  if (byte <= 0) return "0";
  if (byte >= 255) return "1";
  return (byte / 255).toFixed(6).replace(/0+$/, "").replace(/\.$/, "");
};

const godotColor = (hex: string, alpha: number): string => {
  if (alpha === 0) return "Color(0, 0, 0, 0)";
  const { r, g, b } = parseHex(hex);
  const alphaText = alpha === 1 ? "1" : formatChannel(Math.round(alpha * 255));
  return `Color(${formatChannel(r)}, ${formatChannel(g)}, ${formatChannel(b)}, ${alphaText})`;
};

const luminance = (hex: string): number => {
  const { r, g, b } = parseHex(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
};

const contrastText = (skin: Skin, background: string): string =>
  luminance(background) > 0.55 ? skin.ink : skin.paper;

type Margins = { left: number; top: number; right: number; bottom: number };

const BUTTON_MARGINS: Margins = { left: 18, top: 12, right: 18, bottom: 12 };
const PANEL_MARGINS: Margins = { left: 28, top: 24, right: 28, bottom: 24 };
const KEY_MARGINS: Margins = { left: 10, top: 4, right: 10, bottom: 4 };

const styleBox = (id: string, box: StyleBox, margins: Margins): string => {
  const sides = ["left", "top", "right", "bottom"] as const;
  const radii = [
    "top_left",
    "top_right",
    "bottom_right",
    "bottom_left",
  ] as const;
  const lines = [
    `[sub_resource type="StyleBoxFlat" id="${id}"]`,
    ...sides.map(
      (side) => `content_margin_${side} = ${margins[side]}.0`,
    ),
    `bg_color = ${godotColor(box.background, box.backgroundAlpha)}`,
    ...sides.map((side) => `border_width_${side} = ${box.border}`),
    `border_color = ${godotColor(box.borderColor, 1)}`,
    ...radii.map((corner) => `corner_radius_${corner} = ${box.radius}`),
    `shadow_color = ${godotColor(box.shadowColor, box.shadowSize > 0 ? 1 : 0)}`,
    `shadow_size = ${box.shadowSize}`,
    `shadow_offset = Vector2(${box.shadowX}, ${box.shadowY})`,
    "",
  ];
  return lines.join("\n");
};

const fontColors = (typeName: string, color: string): string =>
  ["font_color", "font_focus_color", "font_hover_color", "font_pressed_color"]
    .map((state) => `${typeName}/colors/${state} = ${color}`)
    .join("\n");

export const renderTheme = (skin: Skin): string => {
  const styles = stylesFor(skin);
  const key = fillBox(skin, skin.paper, skin.ink);
  const boxes: Array<[string, StyleBox, Margins]> = [
    ["fill_normal", styles.fill.normal, BUTTON_MARGINS],
    ["fill_hover", styles.fill.hover, BUTTON_MARGINS],
    ["fill_pressed", styles.fill.pressed, BUTTON_MARGINS],
    ["fill_focus", styles.fill.focus, BUTTON_MARGINS],
    ["ghost_normal", styles.ghost.normal, BUTTON_MARGINS],
    ["ghost_hover", styles.ghost.hover, BUTTON_MARGINS],
    ["ghost_pressed", styles.ghost.pressed, BUTTON_MARGINS],
    ["ghost_focus", styles.ghost.focus, BUTTON_MARGINS],
    ["danger_normal", styles.danger.normal, BUTTON_MARGINS],
    ["danger_hover", styles.danger.hover, BUTTON_MARGINS],
    ["danger_pressed", styles.danger.pressed, BUTTON_MARGINS],
    ["danger_focus", styles.danger.focus, BUTTON_MARGINS],
    ["panel", styles.panel, PANEL_MARGINS],
    ["key", key, KEY_MARGINS],
  ];
  const buttonText = godotColor(contrastText(skin, skin.fill), 1);
  const dangerText = godotColor(contrastText(skin, skin.danger), 1);
  const ink = godotColor(styles.text.color, 1);
  const header = `[gd_resource type="Theme" load_steps=${boxes.length + 2} format=3]

[ext_resource type="FontFile" path="res://ui/SourceSans3-Regular.ttf" id="1_font"]

`;
  const body = `${boxes.map(([id, box, margins]) => styleBox(id, box, margins)).join("\n")}
[resource]
default_font = ExtResource("1_font")
default_font_size = 18
${fontColors("Button", buttonText)}
Button/colors/font_disabled_color = ${godotColor(skin.muted, 1)}
Button/font_sizes/font_size = 18
Button/styles/disabled = SubResource("fill_normal")
Button/styles/focus = SubResource("fill_focus")
Button/styles/hover = SubResource("fill_hover")
Button/styles/normal = SubResource("fill_normal")
Button/styles/pressed = SubResource("fill_pressed")
Label/colors/font_color = ${ink}
Label/font_sizes/font_size = 18
Panel/styles/panel = SubResource("panel")
PanelContainer/styles/panel = SubResource("panel")
danger/base_type = "Button"
${fontColors("danger", dangerText)}
danger/styles/focus = SubResource("danger_focus")
danger/styles/hover = SubResource("danger_hover")
danger/styles/normal = SubResource("danger_normal")
danger/styles/pressed = SubResource("danger_pressed")
ghost/base_type = "Button"
${fontColors("ghost", ink)}
ghost/styles/focus = SubResource("ghost_focus")
ghost/styles/hover = SubResource("ghost_hover")
ghost/styles/normal = SubResource("ghost_normal")
ghost/styles/pressed = SubResource("ghost_pressed")
trazo/colors/accent = ${godotColor(skin.accent, 1)}
trazo/colors/danger = ${godotColor(skin.danger, 1)}
trazo/colors/fill = ${godotColor(skin.fill, 1)}
trazo/colors/ink = ${ink}
trazo/colors/muted = ${godotColor(skin.muted, 1)}
trazo/colors/paper = ${godotColor(skin.paper, 1)}
trazo/colors/surface = ${godotColor(skin.surface, 1)}
trazo/colors/text = ${ink}
trazo/constants/space = 8
trazo/styles/key = SubResource("key")
`;
  return header + body;
};

export const loadSkin = async (skinPath: string): Promise<Skin> => {
  const raw = JSON.parse(await readFile(skinPath, "utf8")) as Partial<Skin>;
  if (
    raw.radius === undefined ||
    raw.border === undefined ||
    raw.focusBorder === undefined ||
    raw.shadow?.x === undefined ||
    raw.shadow?.y === undefined ||
    raw.shadow?.size === undefined ||
    raw.ink === undefined ||
    raw.paper === undefined ||
    raw.fill === undefined ||
    raw.accent === undefined ||
    raw.danger === undefined ||
    raw.surface === undefined ||
    raw.muted === undefined
  ) {
    throw new Error(`Skin is incomplete: ${skinPath}`);
  }
  return raw as Skin;
};

export const applySkinFile = async (
  skinPath: string,
  themePath: string,
): Promise<void> => {
  const skin = await loadSkin(skinPath);
  await mkdir(path.dirname(themePath), { recursive: true });
  await writeFile(themePath, renderTheme(skin));
};
