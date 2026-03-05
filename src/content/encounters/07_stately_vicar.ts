// src/content/encounters/07_stately_vicar.ts

import type { EncounterDefinition } from './index.ts';

export const StatelyVicarEncounter: EncounterDefinition = {
	definitionId: 7,
	name: 'Stately Vicar',
	level: 1,
	culture: 'cultivist',
	tempers: ['stately', 'defensive', 'health-conscious'],
	hp: 24,
	maxHp: 24,
	energy: 0,
	maxEnergy: 6,
	moves: [
		{ name: 'Mistify', definitionId: 11, fragments: [{ name: 'Vital Fragment', definitionId: 5 }], maxFragments: 1 },
		{ name: 'Root Out', definitionId: 4, fragments: [{ name: 'Vital Fragment', definitionId: 5 }], maxFragments: 1 },
		{ name: 'Roll Tide', definitionId: 1, fragments: [], maxFragments: 1 },
		{ name: 'Fire Away', definitionId: 3, fragments: [], maxFragments: 1 },
	],
	blessings: [],
};

