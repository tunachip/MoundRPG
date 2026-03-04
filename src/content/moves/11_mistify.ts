// src/content/moves/11_mistify.ts

import { MoveDefinition } from './';

export const Mistify: MoveDefinition = {
	name: 'Mistify',
	type: 'utility',
	element: 'water',
	speed: 'normal',
	canChain: true,
	baseDamage: 0,
	baseIterations: 1,
	operations: {
		fromActive: [
			{ operation: 'applyCooldown',
				args: {
					targetType: 'move',
					target: 'self',
					amount: 3
				}
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
		whileOnCooldown: [
			{ trigger: 'pre:entity:attacked',
				conditions: [
					// 1. 25% chance of true
				],
				operations: [
					// 1. skip next damage
				],
			}
		],
	},
}
