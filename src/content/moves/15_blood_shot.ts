// src/content/moves/15_blood_shot.ts

import type { MoveDefinition } from './index.ts';

export const BloodShot: MoveDefinition = {
	name: 'Blood Shot',
	type: 'utility',
	element: 'vital',
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
					status: 'wound',
					amount: 2,
				},
			},
			{ operation: 'applyStatus',
				args: {
					targetType: 'entity',
					target: 'chosen',
					status: 'wound',
					amount: 2,
				},
			},
			{ operation: 'applyIgnoresStatus',
				args: {
					targetType: 'entity',
					target: 'chosen',
					status: 'sleep',
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
