// src/content/encounters/04_explosive_duelist.ts

import type { EncounterDefinition } from './index.ts';

export const ExplosiveDuelistEncounter: EncounterDefinition = {
	definitionId: 4,
	name: 'Explosive Duelist',
	level: 1,
	culture: 'bastard',
	tempers: ['explosive', 'aggressive', 'offensive'],
	hp: 21,
	maxHp: 21,
	energy: 0,
	maxEnergy: 7,
	moves: [
		{ name: 'Fire Away', definitionId: 3, fragments: [{ name: 'Thunder Fragment', definitionId: 7 }], maxFragments: 1 },
		{ name: 'Stone Toss', definitionId: 2, fragments: [{ name: 'Force Fragment', definitionId: 6 }], maxFragments: 1 },
		{ name: 'General Strike', definitionId: 7, fragments: [], maxFragments: 1 },
		{ name: 'Roll Tide', definitionId: 1, fragments: [], maxFragments: 1 },
	],
	blessings: [],
};

