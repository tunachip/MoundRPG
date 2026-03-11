// src/content/moves/17_charge_up.ts

import type { MoveDefinition } from './index.ts';

export const ChargeUp: MoveDefinition = {
	name: 'Charge Up',
	type: 'utility',
	element: 'thunder',
	speed: 'normal',
	canChain: true,
	baseDamage: 0,
	baseIterations: 1,
	operations: {
		fromActive: [
			//	if chained:
			//		pay x energy
			//		pay y energy from on this move
			//		next x moves gain +y iterations
			//	else:
			//		loopable:
			//			pay 2 energy
			//			if paid:
			//				place 1 energy on this move
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
