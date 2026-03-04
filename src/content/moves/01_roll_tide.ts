// src/content/moves/01_roll_tide.ts

import type { MoveDefinition } from './index.ts';

export const RollTide: MoveDefinition = {
	name: 'Roll Tide',
	type: 'attack',
	element: 'water',
	speed: 'normal',
	canChain: true,
	baseDamage: 2,
	baseIterations: 1,
	operations: {
		fromActive: [
			{ operation: 'applyAttunement',
				args: {
					targetType: 'entity',
					target: 'caster'
				},
			},
			{ operation: 'attack',
				args: {
					target: 'chosen',
					targetType: 'entity',
					element: 'meta',
					baseDamage: 'meta', 
					baseIterations: 'meta',
				}
			}
		],
		fromBanked: [
			{ operation: 'applyAttunement',
				args: {
					targetType: 'entity',
					target: 'caster'
				},
			},
		],
	},
}
