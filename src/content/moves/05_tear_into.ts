// src/content/moves/05_tear_into.ts

import { MoveDefinition } from './';

export const TearInto: MoveDefinition = {
	name: 'Tear Into',
	type: 'attack',
	element: 'vital',
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
