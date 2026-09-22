# Trazo

This file is public. Do not include personal context, private goals, names of
people from the vault, health information, private decisions, or local vault
paths.

**Last updated:** 2026-09-22  
**Status:** active  
**Type:** other

## Goal

Give Godot authors UI they own: tokens, native type variations, and a small
set of game primitives copied into the project, not loaded as a plugin
dependency.

## Done when

- Tokens and native Button variations install into an empty Godot project.
- An editor dock copies registry pieces and their dependencies into `res://`.
- FocusScope, Prompt, Sheet, and SelectableList ship as owned files.
- A real game can change skin through tokens without rewriting those pieces.

## Current state

The public repository, product name, and Shield license exist. The first
Screen will be extracted from a Host inside this repository. There is no
Godot project, Host, registry, or installer yet.

## Next action

Build a Host inside this repository and extract the first Screen from it.
The installer dock waits.

## Links

- Repository: https://github.com/shiarauzo/trazo-game
