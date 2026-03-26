// src/combat/state/constructor.ts

import type { CombatEntities, CombatStateManager } from './index.ts';
import type { Entity } from '../../actor/entity/types.ts';
import { summonEntity } from '../operation/summon.ts';

export function createCombatState (
	player: Entity,
	encounters: Array<Entity>,
): CombatStateManager {
	const combatState: CombatStateManager = {
		turn: 0,
		hasPriority: 0,
		entities: createCombatEntities(),
		moves: [],
		blessings: [],
		listeners: [],
	};

	summonEntity({
		combat: combatState,
		caster: { type: 'entity', index: -1 },
		targets: [],
		summon: {
			entity: player,
			row: 'players',
			position: 0,
		},
	});

	for (let index = 0; index < encounters.length; index += 1) {
		summonEntity({
			combat: combatState,
			caster: { type: 'entity', index: -1 },
			targets: [],
			summon: {
				entity: encounters[index],
				row: 'encounters',
				position: index,
			},
		});
	}

	applyStartingEnergyOffset(combatState);
	return combatState;
}

function createCombatEntities (): CombatEntities {
	const entities = [] as unknown as CombatEntities;
	entities.players = [];
	entities.encounters = [];
	return entities;
}

function applyStartingEnergyOffset (
	combat: CombatStateManager,
): void {
	for (const entity of combat.entities) {
		if (entity.index === combat.hasPriority) {
			continue;
		}
		entity.energy = Math.min(entity.maxEnergy, entity.energy + 1);
	}
}
