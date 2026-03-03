// src/engine/combat/combat.ts

import { EntityData, CombatEntity } from '../../interfaces/entity.ts';
import { CombatMove } from '../../interfaces/move.ts';
import { CombatBlessing } from '../../interfaces/blessing.ts';
import { CombatState } from '../../interfaces/combat.ts';
import { Listener } from '../../interfaces/listener.ts';
import { initializeCombatMoves } from './move.ts';
import { initializeCombatEntity } from './entity.ts';
import { initializeCombatBlessings } from './blessing.ts';
import { initializeListeners } from './listener.ts';
import { getBlessingTemplate } from '../../../data/blessings/index.ts';
import { MoveListenerTypes } from '../../constants.ts';
import { getMoveListenerTemplates } from '../getters/move.ts';

function registerListeners (
	combatListeners: Array<Listener>,
	sourceListeners: Array<number>,
	listenersToRegister: Array<Listener>
): void {
	for (const listener of listenersToRegister) {
		sourceListeners.push(combatListeners.length);
		combatListeners.push(listener);
	}
}

export async function initializeCombatState (
	entityTemplates: Array<EntityData>
): Promise<CombatState> {
	const entities:  Array<CombatEntity> = [];
	const moves:		 Array<CombatMove> = [];
	const blessings: Array<CombatBlessing> = [];
	const listeners: Array<Listener> = [];

	for (const entityTemplate of entityTemplates) {
		const entity = initializeCombatEntity(entityTemplate);
		const entityIndex = entities.length;
		
		// Moves
		const moveTemplates = entityTemplate.moves;
		const combatMoves = await initializeCombatMoves(entityIndex, moveTemplates);
		for (const [moveOffset, move] of combatMoves.entries()) {
			const moveIndex = moves.length;
			const moveTemplate = moveTemplates[moveOffset];
			const listenerTemplates = await getMoveListenerTemplates(
				moveTemplate.templateId
			);
			const listenerIndexes = {
				whileActive: move.whileActiveListenerIndexes,
				whileBanked: move.whileBankedListenerIndexes,
				whileOnCooldown: move.whileOnCooldownListenerIndexes,
			};
			for (const listenerType of MoveListenerTypes) {
				const templates = listenerTemplates[listenerType];
				registerListeners(
					listeners,
					listenerIndexes[listenerType],
					initializeListeners(
						moveIndex,
						'move',
						entityIndex,
						templates
					));
			}
			entity.ownedMoves.push(moveIndex);
			moves.push(move);
		}
		
		// Blessings
		const blessingTemplates = entityTemplate.blessings;
		const combatBlessings = await initializeCombatBlessings(
			entityIndex, blessingTemplates
		);
		for (const [blessingOffset, blessing] of combatBlessings.entries()) {
			const blessingIndex = blessings.length;
			const blessingTemplate = await getBlessingTemplate(
				blessingTemplates[blessingOffset].templateId
			);
			registerListeners(
				listeners,
				blessing.ownedListenerIndexes,
				initializeListeners(
					blessingIndex,
					'blessing',
					entityIndex,
					blessingTemplate.listeners,
				));
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
