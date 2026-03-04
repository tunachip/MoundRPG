// src/content/moves/02_stone_toss.ts

import { MoveDefinition } from './';

export const StoneToss: MoveDefinition = {
	name: 'Stone Toss',
	type: 'attack',
	element: 'stone',
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
