extends Node2D

@export var speed: float = 220.0


func _process(delta: float) -> void:
	var direction := Input.get_vector("move_left", "move_right", "move_up", "move_down")
	position += direction * speed * delta
	position.x = clampf(position.x, 32.0, 1248.0)
	position.y = clampf(position.y, 32.0, 688.0)
