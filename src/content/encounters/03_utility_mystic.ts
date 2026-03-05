// src/content/encounters/03_utility_mystic.ts

import type { EncounterDefinition } from './index.ts';

export const UtilityMysticEncounter: EncounterDefinition = {
	definitionId: 3,
	name: 'Utility Mystic',
	level: 1,
	culture: 'cultivist',
	tempers: ['utilitarian', 'health-conscious', 'stately'],
	hp: 20,
	maxHp: 20,
	energy: 0,
	maxEnergy: 7,
	moves: [
		{ name: 'Mistify', definitionId: 11, fragments: [], maxFragments: 1 },
		{ name: 'Roll Tide', definitionId: 1, fragments: [{ name: 'Water Fragment', definitionId: 1 }], maxFragments: 1 },
		{ name: 'Root Out', definitionId: 4, fragments: [{ name: 'Vital Fragment', definitionId: 5 }], maxFragments: 1 },
		{ name: 'Fire Away', definitionId: 3, fragments: [], maxFragments: 1 },
	],
	blessings: [],
};

