// src/content/encounters/02_tactical_guard.ts

import type { EncounterDefinition } from './index.ts';

export const TacticalGuardEncounter: EncounterDefinition = {
	definitionId: 2,
	name: 'Tactical Guard',
	level: 1,
	culture: 'mason',
	tempers: ['tactical', 'defensive', 'frugal'],
	hp: 24,
	maxHp: 24,
	energy: 0,
	maxEnergy: 6,
	moves: [
		{ name: 'Roll Tide', definitionId: 1, fragments: [], maxFragments: 1 },
		{ name: 'Root Out', definitionId: 4, fragments: [{ name: 'Vital Fragment', definitionId: 5 }], maxFragments: 1 },
		{ name: 'Mistify', definitionId: 11, fragments: [], maxFragments: 1 },
		{ name: 'Stone Toss', definitionId: 2, fragments: [], maxFragments: 1 },
	],
	blessings: [],
};

