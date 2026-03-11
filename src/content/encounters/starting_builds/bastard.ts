// src/content/encounters/starting_builds.ts

import type { EncounterDefinition } from '.././index.ts';

export const ExampleEncounter: EncounterDefinition = {
	definitionId: 0,
	name: 'Bastard',
	level: 1,
	culture: 'bastard',
	tempers: [],
	hp: 20,
	maxHp: 20,
	energy: 0,
	maxEnergy: 6,
	moves: [
		{ name: 'Tear Into',
			definitionId: 5,
			fragments: [],
			maxFragments: 1,
		},
		{ name: 'Tear Into',
			definitionId: 5,
			fragments: [],
			maxFragments: 1,
		},
	],
	blessings: [
	],
}
