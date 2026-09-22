extends CanvasLayer

signal tone_changed(tone: StringName)

@onready var sheet: TrazoSheet = $Sheet
@onready var menu_list: TrazoSelectableList = $Sheet/Center/Panel/FocusScope/Column/Pages/Menu
@onready var settings_list: TrazoSelectableList = $Sheet/Center/Panel/FocusScope/Column/Pages/Settings

var _open := false


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	layer = 100
	sheet.visible = false
	menu_list.confirmed.connect(_on_menu)
	settings_list.confirmed.connect(_on_settings)


func _unhandled_input(event: InputEvent) -> void:
	if not event.is_action_pressed("pause"):
		return
	if _open:
		if _page_visible("Settings"):
			_show_menu()
		else:
			_close()
	else:
		_open_menu()
	get_viewport().set_input_as_handled()


func _open_menu() -> void:
	_open = true
	get_tree().paused = true
	_show_menu()


func _close() -> void:
	_open = false
	sheet.close()
	get_tree().paused = false


func _show_menu() -> void:
	sheet.title_text = "Paused"
	sheet.show_page("Menu")
	sheet.open()


func _page_visible(page_name: String) -> bool:
	var page := sheet.pages.get_node_or_null(page_name)
	return page != null and page.visible


func _on_menu(_index: int, id: StringName) -> void:
	match id:
		&"Resume":
			_close()
		&"Settings":
			sheet.title_text = "Settings"
			sheet.show_page("Settings")
			sheet.open()
		&"Quit":
			get_tree().quit()


func _on_settings(_index: int, id: StringName) -> void:
	match id:
		&"Warm":
			tone_changed.emit(&"warm")
		&"Cold":
			tone_changed.emit(&"cold")
		&"Ash":
			tone_changed.emit(&"ash")
		&"Back":
			_show_menu()
