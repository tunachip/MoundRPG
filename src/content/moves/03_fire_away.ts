// src/content/moves/03_fire_away.ts

import type { MoveDefinition } from './index.ts';

export const FireAway: MoveDefinition = {
	name: 'Fire Away',
	type: 'attack',
	element: 'fire',
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
