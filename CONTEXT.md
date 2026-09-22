# Trazo

Owned game UI for Godot. Language for the files an author copies into a
project and the screens a player uses.

## Language

**Screen**:
The UI a player can open, use, and close inside a running game. Trazo is
extracted from Screens.
_Avoid_: gallery, demo page, kit preview, catalog

**Host**:
The playable game inside this repository that a Screen can interrupt. It
exists so Trazo can be extracted without touching another project.
_Avoid_: demo, gallery, sandbox, playground
