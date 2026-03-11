// src/content/moves/13_sweat_out.ts

import type { MoveDefinition } from './index.ts';

export const SweatOut: MoveDefinition = {
	name: 'Sweat Out',
	type: 'utility',
	element: 'fire',
	speed: 'normal',
	canChain: true,
	baseDamage: 0,
	baseIterations: 1,
	operations: {
		fromActive: [
			// loopable:
				// Declare Element
				// negateAttunement of target of declared Element
				// applyEnergy 1 to moves owner if any lost
				// loop breaks if a non-attuned element is chosen
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
