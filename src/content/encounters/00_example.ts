// src/content/encounters/00_example.ts

import type { EncounterDefinition } from './index.ts';

export const ExampleEncounter: EncounterDefinition = {
	definitionId: 0,
	name: 'Example',
	level: 1,
	culture: 'bastard',
	temper: 'timid',
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
		{ name: 'Fire Away',
			definitionId: 3,
			fragments: [],
			maxFragments: 1,
		},
		{ name: 'Root Out',
			definitionId: 4,
			fragments: [
				{ name: 'Water Fragment',
					definitionId: 1,
				}
			],
			maxFragments: 1,
		},
	],
	blessings: [
	],
}
