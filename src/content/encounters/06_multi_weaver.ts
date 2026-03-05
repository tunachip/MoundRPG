// src/content/encounters/06_multi_weaver.ts

import type { EncounterDefinition } from './index.ts';

export const MultiWeaverEncounter: EncounterDefinition = {
	definitionId: 6,
	name: 'Multi Weaver',
	level: 1,
	culture: 'cultivist',
	tempers: ['multi-tasker', 'tactical', 'spendthrift'],
	hp: 20,
	maxHp: 20,
	energy: 1,
	maxEnergy: 7,
	moves: [
		{ name: 'Mistify', definitionId: 11, fragments: [], maxFragments: 1 },
		{ name: 'Root Out', definitionId: 4, fragments: [{ name: 'Plant Fragment', definitionId: 4 }], maxFragments: 1 },
		{ name: 'Roll Tide', definitionId: 1, fragments: [], maxFragments: 1 },
		{ name: 'Blow Hard', definitionId: 6, fragments: [], maxFragments: 1 },
	],
	blessings: [],
};

