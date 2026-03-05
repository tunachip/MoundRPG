// src/content/encounters/09_chaos_savant.ts

import type { EncounterDefinition } from './index.ts';

export const ChaosSavantEncounter: EncounterDefinition = {
	definitionId: 9,
	name: 'Chaos Savant',
	level: 1,
	culture: 'bastard',
	tempers: ['multi-tasker', 'aggressive', 'earlybird'],
	hp: 20,
	maxHp: 20,
	energy: 1,
	maxEnergy: 7,
	moves: [
		{ name: 'Fire Away', definitionId: 3, fragments: [{ name: 'Fire Fragment', definitionId: 3 }], maxFragments: 1 },
		{ name: 'Blow Hard', definitionId: 6, fragments: [{ name: 'Force Fragment', definitionId: 6 }], maxFragments: 1 },
		{ name: 'Roll Tide', definitionId: 1, fragments: [], maxFragments: 1 },
		{ name: 'Root Out', definitionId: 4, fragments: [], maxFragments: 1 },
	],
	blessings: [],
};

