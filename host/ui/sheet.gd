class_name TrazoSheet
extends Control

signal closed

@export var title_text: String = "Paused"

@onready var title_label: Label = %Title
@onready var pages: Control = %Pages
@onready var focus_scope: TrazoFocusScope = $Center/Panel/FocusScope


func _ready() -> void:
	visible = false
	process_mode = Node.PROCESS_MODE_ALWAYS
	title_label.text = title_text


func open() -> void:
	visible = true
	title_label.text = title_text
	focus_scope.capture()


func close() -> void:
	visible = false
	closed.emit()


func show_page(page_name: String) -> void:
	for child in pages.get_children():
		child.visible = child.name == page_name
	focus_scope.capture()
