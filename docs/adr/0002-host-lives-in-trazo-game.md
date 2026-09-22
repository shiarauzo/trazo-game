# The first Screen lives in a Host inside this repository

The first Screen could have been built inside an existing Godot game. That
would have been more realistic and would have risked breaking that game and
mixing licenses. The first Screen lives in a Host inside `trazo-game` so
extraction stays isolated. The Host must still be a game a Screen can
interrupt, not a catalog of widgets.
