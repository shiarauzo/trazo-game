# Trazo

Owned game UI for Godot.

You copy tokens, scenes, and primitives into your project. The files stay
yours. Trazo is not a runtime plugin and not a theme pack you keep depending
on.

## Try the Host

Godot 4.4 or newer.

1. Open `host/project.godot`.
2. Run the main scene.
3. Move with WASD or arrows.
4. Press Escape to pause. Settings changes the floor. Resume keeps the change.

## Copy files into your project

Needs [Bun](https://bun.sh).

```bash
bun cli/main.ts list
bun cli/main.ts init /path/to/your-godot-project
bun cli/main.ts add base /path/to/your-godot-project
```

`init` copies tokens. `add base` copies Sheet, Prompt, SelectableList,
FocusScope, and tokens. Existing files are left alone unless you pass
`--force`.

Point your project theme at `res://ui/theme.tres` after `init`.

## Use

Use Trazo inside games and tools you ship.

Do not copy, rebrand, or republish Trazo as a UI kit, addon, theme pack,
component library, or substitute. The name Trazo is reserved.

See `LICENSE` for the full terms.

## License

Copyright 2026 Shiara Arauzo.

Source-available under the [PolyForm Shield License 1.0.0](LICENSE).
That license lets you use Trazo for permitted purposes. It does not let you
offer a competing product.
