extends Node2D

const TONES := {
	&"warm": Color(0.14902, 0.133333, 0.117647, 1),
	&"cold": Color(0.117647, 0.133333, 0.14902, 1),
	&"ash": Color(0.121569, 0.121569, 0.121569, 1),
}

@onready var floor_rect: ColorRect = $Floor
@onready var pause_screen: CanvasLayer = $Pause
@onready var prompt: TrazoPrompt = $HUD/Prompt


func _ready() -> void:
	pause_screen.tone_changed.connect(_on_tone_changed)
	pause_screen.opened.connect(prompt.dismiss)
	_on_tone_changed(&"warm")


func _on_tone_changed(tone: StringName) -> void:
	floor_rect.color = TONES.get(tone, TONES[&"warm"])
