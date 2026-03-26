// src/shared/damageRules.ts

import type { DamageElement } from "";

interface DamageRule {
	weakTo:		Array<DamageElement>;
	resists:	Array<DamageElement>;
	blocks:		Array<DamageElement>;
	absorbs:	Array<DamageElement>;
}

export function getDamageRules (
	damageElement: DamageElement
): DamageRule {
	switch (damageElement) {
		case 'water':
			return {
				weakTo: ['stone', 'fire'],
				resists: ['thunder'],
				blocks: [],
				absorbs: ['plant'],
			}
		case 'stone':
			return {
				weakTo: ['fire', 'thunder'],
				resists: ['water'],
				blocks: ['force'],
				absorbs: [],
			}
		case 'fire':
			return {
				weakTo: ['plant'],
				resists: ['stone'],
				blocks: [],
				absorbs: ['water'],
			}
		case 'plant':
			return {
				weakTo: ['water', 'vital'],
				resists: [],
				blocks: [],
				absorbs: ['fire'],
			}
		case 'vital':
			return {
				weakTo: ['vital'],
				resists: [],
				blocks: [],
				absorbs: [],
			}
		case 'force':
			return {
				weakTo: ['vital', 'stone'],
				resists: ['plant'],
				blocks: ['thunder'],
				absorbs: [],
			}
		case 'thunder':
			return {
				weakTo: ['water'],
				resists: ['force'],
				blocks: ['stone'],
				absorbs: [],
			}
		default:
			throw new Error(`Unknown damage element: ${damageElement}`);
	}	
}
