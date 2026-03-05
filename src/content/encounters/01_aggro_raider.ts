// src/content/encounters/01_aggro_raider.ts

import type { EncounterDefinition } from './index.ts';

export const AggroRaiderEncounter: EncounterDefinition = {
	definitionId: 1,
	name: 'Aggro Raider',
	level: 1,
	culture: 'nomad',
	tempers: ['aggressive', 'offensive', 'spendthrift'],
	hp: 22,
	maxHp: 22,
	energy: 0,
	maxEnergy: 6,
	moves: [
		{ name: 'Stone Toss', definitionId: 2, fragments: [], maxFragments: 1 },
		{ name: 'Fire Away', definitionId: 3, fragments: [], maxFragments: 1 },
		{ name: 'General Strike', definitionId: 7, fragments: [], maxFragments: 1 },
		{ name: 'Blow Hard', definitionId: 6, fragments: [], maxFragments: 1 },
	],
	blessings: [],
};
