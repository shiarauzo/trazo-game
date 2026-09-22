extends SceneTree

func _initialize() -> void:
	call_deferred("_run")


func _run() -> void:
	var packed := load("res://world/room.tscn") as PackedScene
	if packed == null:
		_fail("room.tscn failed to load")
		return

	var room := packed.instantiate() as Node2D
	root.add_child(room)
	await process_frame

	var pause := room.get_node_or_null("Pause")
	var floor_rect := room.get_node_or_null("Floor") as ColorRect
	var sheet := room.get_node_or_null("Pause/Sheet") as Control
	var menu := room.get_node_or_null(
		"Pause/Sheet/Center/Panel/FocusScope/Column/Pages/Menu"
	)
	var settings := room.get_node_or_null(
		"Pause/Sheet/Center/Panel/FocusScope/Column/Pages/Settings"
	)
	var prompt := room.get_node_or_null("HUD/Prompt")

	if pause == null or floor_rect == null or sheet == null:
		_fail("Host nodes missing")
		return
	if menu == null or settings == null or prompt == null:
		_fail("Screen pieces missing")
		return

	pause.call("_open_menu")
	if not sheet.visible:
		_fail("sheet did not open")
		return
	if not paused:
		_fail("tree did not pause")
		return

	pause.call("_on_menu", 1, &"Settings")
	if not settings.visible or menu.visible:
		_fail("settings page did not replace the menu")
		return

	var before := floor_rect.color
	pause.call("_on_settings", 1, &"Cold")
	if floor_rect.color == before:
		_fail("floor tone did not change")
		return

	pause.call("_on_menu", 0, &"Resume")
	if sheet.visible or paused:
		_fail("resume did not return to the room")
		return

	print("VERIFY_OK")
	quit(0)


func _fail(message: String) -> void:
	push_error(message)
	quit(1)
