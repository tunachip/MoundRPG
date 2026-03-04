// src/world/encounters.ts

import type { Entity } from '../actor/entity/types.ts';
import type { EncounterDefinition } from '../content/encounters/index.ts';
import { getEncounterDefinition } from '../content/encounters/index.ts';

export function createEncounterEntity (
	definitionId: number
): Entity {
	return createEncounterEntityFromDefinition(getEncounterDefinition(definitionId));
}

export function createEncounterEntityFromDefinition (
	definition: EncounterDefinition
): Entity {
	return {
		name: definition.name,
		level: definition.level,
		type: 'encounter',
		culture: definition.culture,
		hp: definition.hp,
		maxHp: definition.maxHp,
		energy: definition.energy,
		maxEnergy: definition.maxEnergy,
		moves: definition.moves,
		blessings: definition.blessings,
		inventory: {
			items: [],
			xp: 0,
		},
		definitionId: definition.definitionId,
	};
}
