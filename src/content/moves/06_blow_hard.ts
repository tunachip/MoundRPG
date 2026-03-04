// src/content/moves/06_blow_hard.ts

import type { MoveDefinition } from './index.ts';

export const BlowHard: MoveDefinition = {
	name: 'Blow Hard',
	type: 'attack',
	element: 'force',
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
