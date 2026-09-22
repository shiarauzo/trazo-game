# Trazo

Owned game UI for Godot. Language for the files an author copies into a
project and the screens a player uses.

## Language

**Author**:
The person who copies Trazo into a Godot project and edits those files.
_Avoid_: user, customer, developer

**Player**:
The person who uses a Screen in a running game.
_Avoid_: user

**Screen**:
The UI a player can open, use, and close inside a running game. Trazo is
extracted from Screens.
_Avoid_: gallery, demo page, kit preview, catalog

**Host**:
The playable game inside this repository that a Screen can interrupt. It
exists so Trazo can be extracted without touching another project.
_Avoid_: demo, gallery, sandbox, playground

**Token**:
A named value in the Theme an author owns: color, space, type, or StyleBox.
_Avoid_: variable, constant, CSS token

**Piece**:
A named set of files an author can copy into a project, with declared
dependencies.
_Avoid_: component, widget, addon, plugin

**Registry**:
The catalog of Pieces and the files each one copies.
_Avoid_: package, plugin list, asset library
