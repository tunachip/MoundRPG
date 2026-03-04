import { MoveTemplate } from '../../../engine/templates/move.ts';

export const stoneTossMove: MoveTemplate = {
	name: 'Stone Toss',
	devNotes: 'Basic Stone Attack. When Cast, Attunes Caster to Stone & Deals 2 Stone Damage to Chosen Target.',
	moveType: 'attack',
	moveSpeed: 'normal',
	element: 'stone',
	baseDamage: 2,
	baseIterations: 1,
	canChain: true,
	canBeChainedInto: true,
	operations: {
		fromActive: [
			{
				name: 'applyAttunement',
				args: {
					target: '$caster',
					element: '$this.element'
				}
			},
			{
				name: 'loop',
				args: {
					iterations: '$this.iterations',
					operations: [
						{
							name: 'attack',
							args: {
								target: '$choice',
								element: '$this.element',
								baseDamage: '$this.baseDamage'
							}
						}
					]
				}
			}
		],
		fromBanked: [
			{
				name: 'applyAttunement',
				args: {
					target: '$caster',
					element: '$this.element'
				}
			},
			{
				name: 'activateMove',
				args: {
					target: '$this'
				}
			}
		]
	}
};
