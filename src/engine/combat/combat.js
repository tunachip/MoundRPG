// src/engine/combat/combat.js
import { CombatEntity } from './entity.js';
import { CombatMove } from './move.js';

export class CombatState {
	constructor (player, encounters = []) {
		this.turn = 1;

		// CombatEntities
		const entityTemplates = [player, ...encounters];
		this.entities = entityTemplates.map(template => {
			return new CombatEntity(template.name, template.hp);
		});

		// CombatMoves
		this.moves = [];
		entityTemplates.forEach((template, i) => {
			const owner = this.entities[i];
			(template.moves || []).forEach(moveTemplate => {
				const move = new CombatMove(moveTemplate, owner);
				this.moves.push(move);
				owner.movesOwned.push(this.moves.length - 1);
			});
		});

		// EventListeners
		this.listeners = {};
	}
}

