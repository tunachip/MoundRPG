// src/content/moves/16_make_sick.ts

import type { MoveDefinition } from './index.ts';

export const MakeSick: MoveDefinition = {
	name: 'Make Sick',
	type: 'utility',
	element: 'force',
	speed: 'normal',
	canChain: true,
	baseDamage: 0,
	baseIterations: 1,
	operations: {
		fromActive: [
			// declare status of statuses self has
			// both players gain 1 turn of declared status
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
