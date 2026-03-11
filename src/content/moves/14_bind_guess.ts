// src/content/moves/14_bind_guess.ts

import type { MoveDefinition } from './index.ts';

export const BindGuess: MoveDefinition = {
	name: 'Bind Guess',
	type: 'utility',
	element: 'plant',
	speed: 'normal',
	canChain: true,
	baseDamage: 0,
	baseIterations: 1,
	operations: {
		fromActive: [
			// bankMove
			// bindMove <-- same target as above
			// applyCooldown perpetual to self
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
