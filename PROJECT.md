# Trazo

This file is public. Do not include personal context, private goals, names of
people from the vault, health information, private decisions, or local vault
paths.

**Last updated:** 2026-09-27  
**Status:** active  
**Type:** other

## Goal

Give Godot authors UI they own: tokens, native type variations, and a small
set of game primitives copied into the project, not loaded as a plugin
dependency.

## Done when

- Tokens and native Button variations install into an empty Godot project.
- A CLI copies registry pieces and their dependencies into `res://`.
- FocusScope, Prompt, Sheet, and SelectableList ship as owned files.
- A Host can change skin through tokens without rewriting those pieces.

## Current state

The Host, token Theme, pause Screen, base pieces, and CLI exist in this
repository. A skin file rewrites that theme in one apply. Fill, danger, the
sheet, and the prompt key share radius, border, and shadow. Focus uses a
thicker border. Ghost keeps the radius and border, and stays an outline. The
Host prompt is visible until pause opens, then it stays gone.
People can open `host/` in Godot or copy files with `bun cli/main.ts`.

## Next action

Copy `base` into a real game and see which Piece the skin does not cover.

## Links

- Repository: https://github.com/shiarauzo/trazo-game
