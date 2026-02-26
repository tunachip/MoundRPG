// src/engine/combat/move.js


export class MoveTemplate {
	constructor (data) {
		this.name    = data.name;
		this.element = data.element;
		this.type    = data.type;
		this.logic   = data.logic;
	}
}

export class CombatMove {
	constructor (template, owner) {
		this.name          = template.name;
		this.element       = template.element;
		this.type          = template.type;
		this.logic         = template.logic;
		this.owner				 = owner;
		this.cooldownTurns = 0;
		this.banked        = false;
	}
}
