class_name TrazoPrompt
extends HBoxContainer

@export var action_name: StringName = &"pause"
@export var caption: String = "Pause"

@onready var key_label: Label = %Key
@onready var caption_label: Label = %Caption


func _ready() -> void:
	add_theme_constant_override("separation", 8)
	caption_label.text = caption
	key_label.text = _event_text()
	var key_style := get_theme_stylebox("key", "trazo")
	if key_style:
		key_label.add_theme_stylebox_override("normal", key_style)


func _event_text() -> String:
	var events := InputMap.action_get_events(action_name)
	if events.is_empty():
		return "-"
	var event := events[0]
	if event is InputEventKey:
		return OS.get_keycode_string((event as InputEventKey).physical_keycode)
	return event.as_text()
