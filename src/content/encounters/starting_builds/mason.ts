// src/content/encounters/starting_builds/mason.ts

import type { EncounterDefinition } from './../index.ts';

export const ExampleEncounter: EncounterDefinition = {
	definitionId: 0,
	name: 'Mason',
	level: 1,
	culture: 'mason',
	tempers: [],
	hp: 20,
	maxHp: 20,
	energy: 0,
	maxEnergy: 6,
	moves: [
		{ name: 'Roll Tide',
			definitionId: 1,
			fragments: [],
			maxFragments: 1,
		},
		{ name: 'Stone Toss',
			definitionId: 2,
			fragments: [],
			maxFragments: 1,
		},
	],
	blessings: [
	],
}
