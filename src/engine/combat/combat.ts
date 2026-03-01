// src/engine/combat/combat.ts

import { EntityData, CombatEntity } from '../interfaces/entity.ts';
import { CombatMove } from '../interfaces/move.ts';
import { CombatBlessing } from '../interfaces/blessing.ts';
import { CombatState } from '../interfaces/combat.ts';
import { Listener } from '../interfaces/listener.ts';
import { initializeCombatMoves } from './move.ts';
import { initializeCombatEntity } from './entity.ts';
import { initializeCombatBlessings } from './blessing.ts';

export async function initializeCombatState (
	entityTemplates: Array<EntityData>
): Promise<CombatState> {
	const entities: Array<CombatEntity> = [];
	const moves: Array<CombatMove> = [];
	const blessings: Array<CombatBlessing> = [];
	const listeners: Array<Listener> = [];

	for (const entityTemplate of entityTemplates) {
		const entity = initializeCombatEntity(entityTemplate);
		const entityIndex = entities.length;
		
		const moveTemplates = entityTemplate.moves
		const combatMoves = await initializeCombatMoves(entityIndex, moveTemplates);
		for (const move of combatMoves) {
			const moveIndex = moves.length;
			// TODO: Init Move Spawned Listeners
			entity.ownedMoves.push(moveIndex);
			moves.push(move);
		}
		
		const blessingTemplates = entityTemplate.blessings;
		const combatBlessings = initializeCombatBlessings(entityIndex, blessingTemplates);
		for (const blessing of combatBlessings) {
			const blessingIndex = blessings.length;
			// TODO: Init Blessing Spawned Listeners
			entity.ownedBlessings.push(blessingIndex);
			blessings.push(blessing);
		}

		// TODO: Init Entity Spawned Listeners
		entities.push(entity);
	}
	const combatState: CombatState = {
		turn: 0,
		entities: entities,
		moves: moves,
		blessings: blessings,
		listeners: listeners,
	}
	return combatState;
}
