// src/content/moves/12_try_hard.ts

import type { MoveDefinition } from './index.ts';

export const TryHard: MoveDefinition = {
	name: 'Try Hard',
	type: 'utility',
	element: 'stone',
	speed: 'normal',
	canChain: true,
	baseDamage: 0,
	baseIterations: 1,
	operations: {
		fromActive: [
			{ operation: 'applyStatus',
				args: {
					targetType: 'entity',
					target: 'chosen',
					status: 'slow',
					amount: 2,
				},
			},
			{ operation: 'applyStatus',
				args: {
					targetType: 'entity',
					target: 'chosen',
					status: 'tough',
					amount: 2,
				},
			},
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
