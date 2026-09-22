class_name TrazoFocusScope
extends Control

func capture() -> void:
	var target := _first_focusable(self)
	if target:
		target.grab_focus()


func _first_focusable(node: Node) -> Control:
	if node != self and node is BaseButton and node.visible:
		return node
	for child in node.get_children():
		if child is Control and not child.visible:
			continue
		var found := _first_focusable(child)
		if found:
			return found
	return null
