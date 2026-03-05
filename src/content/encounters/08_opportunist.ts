// src/content/encounters/08_opportunist.ts

import type { EncounterDefinition } from './index.ts';

export const OpportunistEncounter: EncounterDefinition = {
	definitionId: 8,
	name: 'Opportunist',
	level: 1,
	culture: 'nomad',
	tempers: ['tactical', 'offensive', 'frugal'],
	hp: 21,
	maxHp: 21,
	energy: 0,
	maxEnergy: 6,
	moves: [
		{ name: 'Stone Toss', definitionId: 2, fragments: [{ name: 'Stone Fragment', definitionId: 2 }], maxFragments: 1 },
		{ name: 'Roll Tide', definitionId: 1, fragments: [{ name: 'Water Fragment', definitionId: 1 }], maxFragments: 1 },
		{ name: 'General Strike', definitionId: 7, fragments: [], maxFragments: 1 },
		{ name: 'Mistify', definitionId: 11, fragments: [], maxFragments: 1 },
	],
	blessings: [],
};

