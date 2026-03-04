// src/combat/state/constructor.ts

import { CombatState, CombatEntity, CombatBlessing, CombatMove } from './';
import { Entity, Move, Blessing } from '../../actor';
import { Listener, createListener, registerListeners } from '../listener';

interface CombatMoves {
	moves: Array<CombatMove>;
	indexes: Array<number>;
}

interface CombatBlessings {
	blessings: Array<CombatBlessing>;
	indexes: Array<number>;
}

interface Listeners {
	listeners: Array<Listener>;
	indexes: Array<number>;
}

export function createCombatState (
	player: Entity,
	encounters: Array<Entity>,
): CombatState {
	const entities: Array<CombatEntity> = [];
	const moves: Array<CombatMove> = [];
	const blessings: Array<CombatBlessing> = [];
	const listeners: Array<Listener> = [];

	entities.push(createCombatEntity(player));
	for (const entity of encounters) {
		const entityIndex = entities.length;
		const entityMoves = createCombatMoves(entity, entityIndex);
		const entityBlessings = createCombatBlessings(entity, entityIndex);
		const combatEntity = createCombatEntity(entity, )
	}


	return {
		turn: 0,
		entities: [],
		moves: [],
		blessings: [],
		listeners: [],
	};
}

function createCombatEntity (
	entity: Entity,
	moveIndexes: Array<number>,
	blessingIndexes: Array<number>,
): CombatEntity {
}

function createCombatMoves (
	entity: Entity,
	entityIndex: number
): CombatMoves {
	const combatMoves: Array<CombatMove> = [];
	const indexes: Array<number> = [];

	return {
		moves: combatMoves,
		indexes: indexes,
	};
}
function createCombatBlessings (
	entity: Entity,
	entityIndex: number,
): CombatBlessings {
	const combatBlessings: Array<CombatBlessing> = [];
	const indexes: Array<number> = [];
	for (const blessing of entity.blessings) {
		indexes.push(indexes.length);

		// Create Blessing from BlessingDefinition

		combatBlessings.push({
			name: blessing.name,
			ownerIndex: entityIndex,
			cooldownTurns: 0,
		})
	}

	return {
		blessings: combatBlessings,
		indexes: indexes,
	};
}
