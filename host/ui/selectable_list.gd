class_name TrazoSelectableList
extends VBoxContainer

signal confirmed(index: int, id: StringName)


func _ready() -> void:
	add_theme_constant_override("separation", 8)
	for index in get_child_count():
		var child := get_child(index)
		if child is BaseButton:
			var button := child as BaseButton
			button.pressed.connect(_emit_confirmed.bind(index, button.name))


func _emit_confirmed(index: int, id: StringName) -> void:
	confirmed.emit(index, id)
