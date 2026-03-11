// src/content/encounters/99_test_enemy.ts

import type { EncounterDefinition } from './index.ts';

export const ExampleEncounter: EncounterDefinition = {
	definitionId: 0,
	name: 'Example Encounter',
	level: 1,
	culture: 'bastard',
	tempers: ['aggressive'],
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
				{ name: 'Vital Fragment',
					definitionId: 5,
				}
			],
			maxFragments: 1,
		},
	],
	blessings: [
	],
}
