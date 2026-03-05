// src/content/encounters/05_early_sentinel.ts

import type { EncounterDefinition } from './index.ts';

export const EarlySentinelEncounter: EncounterDefinition = {
	definitionId: 5,
	name: 'Early Sentinel',
	level: 1,
	culture: 'mason',
	tempers: ['earlybird', 'defensive', 'frugal'],
	hp: 23,
	maxHp: 23,
	energy: 0,
	maxEnergy: 6,
	moves: [
		{ name: 'Roll Tide', definitionId: 1, fragments: [], maxFragments: 1 },
		{ name: 'Mistify', definitionId: 11, fragments: [], maxFragments: 1 },
		{ name: 'Root Out', definitionId: 4, fragments: [], maxFragments: 1 },
		{ name: 'Stone Toss', definitionId: 2, fragments: [], maxFragments: 1 },
	],
	blessings: [],
};

