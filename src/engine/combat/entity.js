
import { ELEMENTS, STATUSES } from '../constants.js';

export class EntityTemplate {
	constructor (name, moves=[], items=[]) {
		this.name  = name;
		this.hp		 = 20;
		this.level = 1;
		this.moves = moves;
		this.items = items;
	}
}

export class CombatEntity {
	constructor (name, hp, combatIndex) {
		this.combatIndex		 = combatIndex;
		this.name            = name;
		this.hp              = hp;
		this.maxHp           = hp;
		this.energy          = 0;
		this.maxEnergy       = 6;
		this.attunedTo       = Object.fromEntries(ELEMENTS.map(e => [e, false]))
		this.turnsAttuned    = Object.fromEntries(ELEMENTS.map(e => [e, 0]))
		this.hasStatus       = Object.fromEntries(STATUSES.map(s => [s, false]))
		this.statusTurnsLeft = Object.fromEntries(STATUSES.map(s => [s, 0]))
		this.movesOwned			 = [];
	}
}

