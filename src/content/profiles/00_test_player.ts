// src/content/profiles/00_test_player.ts

import type { Entity } from '../../actor/entity/types.ts';

export const TestPlayerProfile: Entity = {
	name: 'Test Player',
	level: 1,
	type: 'player',
	culture: 'mason',
	hp: 24,
	maxHp: 24,
	energy: 2,
	maxEnergy: 6,
	moves: [
		{
			name: 'Roll Tide',
			definitionId: 1,
			fragments: [],
			maxFragments: 1,
		},
		{
			name: 'Mistify',
			definitionId: 11,
			fragments: [],
			maxFragments: 1,
		},
	],
	blessings: [],
	inventory: {
		items: [],
		xp: 0,
	},
};
